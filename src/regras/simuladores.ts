import type { EntradaFatura, EntradaJuros } from '@/dados/tipos';

/** RN06: taxa sugerida. Trocar aqui pelo CDI anualizado base 252 real, com a data de referência e a fonte. */
export const TAXA_SUGERIDA = {
  percentual: 10,
  unidade: 'ano' as const,
  ehExemplo: true,
  dataReferencia: null as string | null, // dd/mm/aaaa, quando for o CDI real
  fonte: null as string | null,
  texto: 'Valor de exemplo — será trocado pelo CDI anualizado base 252 do Banco Central',
};

export const AVISO_JUROS = 'Simulação educativa. Não constitui recomendação de investimento. A taxa não é atualizada automaticamente e o cálculo não desconta Imposto de Renda nem IOF.';
export const AVISO_FATURA = 'Simulação educativa e simplificada. Não constitui recomendação financeira. Não considera multa, juros de mora nem IOF.';

export const taxaMensalEquivalente = (taxaAnual: number) => Math.pow(1 + taxaAnual, 1 / 12) - 1;
export const taxaAnualEquivalente = (taxaMensal: number) => Math.pow(1 + taxaMensal, 12) - 1;

/** RN01: M = C × (1 + i)^t + A × ((1 + i)^t − 1) / i, com aporte no fim de cada mês. */
export function calcularMontante(valorInicial: number, aporteMensal: number, taxaMensal: number, meses: number): number {
  if (taxaMensal === 0) return valorInicial + aporteMensal * meses;
  const fator = Math.pow(1 + taxaMensal, meses);
  return valorInicial * fator + aporteMensal * ((fator - 1) / taxaMensal);
}

export interface PontoEvolucao { mes: number; saldo: number; investido: number }
export interface ResultadoJuros { montante: number; totalInvestido: number; totalJuros: number; taxaMensal: number; prazoMeses: number; evolucao: PontoEvolucao[] }

export function simularJuros(e: EntradaJuros): ResultadoJuros {
  const taxaMensal = e.unidadeTaxa === 'mes' ? e.taxaPercentual / 100 : taxaMensalEquivalente(e.taxaPercentual / 100);
  const prazoMeses = e.unidadePrazo === 'meses' ? e.prazo : e.prazo * 12;
  const evolucao = Array.from({ length: prazoMeses + 1 }, (_, mes) => ({
    mes,
    saldo: calcularMontante(e.valorInicial, e.aporteMensal, taxaMensal, mes),
    investido: e.valorInicial + e.aporteMensal * mes,
  }));
  const montante = evolucao[prazoMeses].saldo;
  const totalInvestido = evolucao[prazoMeses].investido;
  return { montante, totalInvestido, totalJuros: montante - totalInvestido, taxaMensal, prazoMeses, evolucao };
}

export class ErroSemRotativo extends Error {
  constructor() {
    super('Com esse pagamento não sobra saldo para o rotativo: não há incidência de juros do rotativo.');
  }
}

export interface LinhaFatura { mes: number; situacao: string; pagamento: number; juros: number; saldo: number }
export interface ResultadoFatura {
  pagandoTotal: { totalPago: number; juros: number };
  pagandoMinimo: { totalPago: number; juros: number; jurosRotativo: number; saldoRotativo: number; saldoParcelado: number; parcela: number; somaParcelas: number };
  custoExtra: number;
  tetoAplicado: boolean;
  taxaParcelamentoEfetiva: number; // fração ao mês usada na tabela
  tabela: LinhaFatura[];
}

/** Tabela Price: parcela de um valor presente em n meses, primeira parcela um mês depois. */
export const parcelaPrice = (valor: number, taxa: number, n: number) => (taxa === 0 ? valor / n : (valor * taxa) / (1 - Math.pow(1 + taxa, -n)));

/** Taxa que gera uma parcela (bisseção; é o mesmo valor da função TAXA do Excel). */
export function taxaPorParcela(valor: number, parcela: number, n: number, taxaMaxima: number): number {
  let baixo = 0;
  let alto = taxaMaxima;
  for (let k = 0; k < 200; k++) {
    const meio = (baixo + alto) / 2;
    if (parcelaPrice(valor, meio, n) > parcela) alto = meio;
    else baixo = meio;
  }
  return (baixo + alto) / 2;
}

/** RN05: rotativo só até a próxima fatura (CMN 4.549/2017), depois Price; juros totais ≤ 100% do saldo (Lei 14.690/2023). */
export function simularFatura(e: EntradaFatura): ResultadoFatura {
  if (e.pagamentoMinimo >= e.valorFatura) throw new ErroSemRotativo();
  const saldoRotativo = e.valorFatura - e.pagamentoMinimo;
  const taxaRotativo = e.taxaRotativoPercentual / 100;
  const taxaParcelamento = e.taxaParcelamentoPercentual / 100;
  const n = e.parcelas;
  const jurosRotativo = saldoRotativo * taxaRotativo;
  const saldoParcelado = saldoRotativo + jurosRotativo;

  let parcela = parcelaPrice(saldoParcelado, taxaParcelamento, n);
  let taxaEfetiva = taxaParcelamento;
  const tetoAplicado = n * parcela - saldoRotativo > saldoRotativo;
  if (tetoAplicado) {
    parcela = (2 * saldoRotativo) / n;
    taxaEfetiva = taxaPorParcela(saldoParcelado, parcela, n, taxaParcelamento);
  }
  const somaParcelas = n * parcela;
  const juros = somaParcelas - saldoRotativo;

  const tabela: LinhaFatura[] = [
    { mes: 0, situacao: 'Pagamento mínimo', pagamento: e.pagamentoMinimo, juros: 0, saldo: saldoRotativo },
    { mes: 1, situacao: 'Rotativo (até a próxima fatura)', pagamento: 0, juros: jurosRotativo, saldo: saldoParcelado },
  ];
  let saldo = saldoParcelado;
  for (let k = 1; k <= n; k++) {
    const jurosDoMes = saldo * taxaEfetiva;
    saldo = saldo + jurosDoMes - parcela;
    tabela.push({ mes: k + 1, situacao: `Parcela ${k} de ${n}`, pagamento: parcela, juros: jurosDoMes, saldo: k === n ? 0 : saldo });
  }

  return {
    pagandoTotal: { totalPago: e.valorFatura, juros: 0 },
    pagandoMinimo: { totalPago: e.pagamentoMinimo + somaParcelas, juros, jurosRotativo, saldoRotativo, saldoParcelado, parcela, somaParcelas },
    custoExtra: juros,
    tetoAplicado,
    taxaParcelamentoEfetiva: taxaEfetiva,
    tabela,
  };
}
