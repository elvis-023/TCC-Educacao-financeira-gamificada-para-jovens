import { describe, expect, it } from 'vitest';
import {
  calcularMontante, ErroSemRotativo, simularFatura, simularJuros, TAXA_SUGERIDA, taxaAnualEquivalente, taxaMensalEquivalente,
} from './simuladores';

const centavos = (valor: number) => Math.round(valor * 100);
const juros1 = { valorInicial: 1000, aporteMensal: 100, taxaPercentual: 1, unidadeTaxa: 'mes', prazo: 12, unidadePrazo: 'meses' } as const;

describe('juros compostos (RN01, RN06)', () => {
  it('RN01: R$ 1.000 + R$ 100/mês a 1% ao mês em 12 meses = R$ 2.395,08 (aceite fixo)', () => {
    const r = simularJuros(juros1);
    expect(centavos(r.montante)).toBe(239508);
    expect(centavos(r.totalInvestido)).toBe(220000);
    expect(centavos(r.totalJuros)).toBe(19508);
  });
  it('RN01: taxa 0 usa M = C + A × t', () => {
    expect(centavos(calcularMontante(1000, 100, 0, 12))).toBe(220000);
    expect(centavos(simularJuros({ ...juros1, taxaPercentual: 0 }).montante)).toBe(220000);
  });
  it('RN01: taxa anual vira mensal por equivalência, nunca dividida por 12', () => {
    const r = simularJuros({ ...juros1, aporteMensal: 0, taxaPercentual: 10, unidadeTaxa: 'ano' });
    expect(centavos(r.montante)).toBe(110000);
    expect(centavos(calcularMontante(1000, 0, 0.1 / 12, 12))).toBe(110471); // o erro que a regra evita
    expect(taxaMensalEquivalente(0.1)).toBeCloseTo(0.0079741404, 9);
    expect(taxaAnualEquivalente(0.01)).toBeCloseTo(0.1268250301, 9);
  });
  it('RN01: prazo de 1 ano dá o mesmo que 12 meses', () => {
    const r = simularJuros({ ...juros1, prazo: 1, unidadePrazo: 'anos' });
    expect(r.prazoMeses).toBe(12);
    expect(centavos(r.montante)).toBe(239508);
  });
  it('RN01: evolução mês a mês, do mês 0 ao prazo', () => {
    const r = simularJuros(juros1);
    expect(r.evolucao).toHaveLength(13);
    expect(r.evolucao[0]).toEqual({ mes: 0, saldo: 1000, investido: 1000 });
    expect(centavos(r.evolucao[12].saldo)).toBe(239508);
    expect(r.evolucao[12].investido).toBe(2200);
  });
  it('RN06: taxa sugerida é o CDI anualizado base 252, numa constante única com data de referência e fonte', () => {
    expect(TAXA_SUGERIDA).toMatchObject({ percentual: 13.65, unidade: 'ano', ehExemplo: false, dataReferencia: '29/10/2026' });
    expect(TAXA_SUGERIDA.fonte).toContain('Banco Central');
  });
});

describe('fatura do cartão (RN05)', () => {
  const base = { valorFatura: 1000, pagamentoMinimo: 150, taxaRotativoPercentual: 15 };

  it('RN05: sem teto — parcelamento de 9% ao mês em 12 parcelas', () => {
    const r = simularFatura({ ...base, taxaParcelamentoPercentual: 9, parcelas: 12 });
    expect(r.tetoAplicado).toBe(false);
    expect(centavos(r.pagandoMinimo.jurosRotativo)).toBe(12750);
    expect(centavos(r.pagandoMinimo.saldoParcelado)).toBe(97750);
    expect(centavos(r.pagandoMinimo.parcela)).toBe(13651);
    expect(centavos(r.pagandoMinimo.totalPago)).toBe(178810);
    expect(centavos(r.pagandoMinimo.juros)).toBe(78810);
    expect(centavos(r.custoExtra)).toBe(78810);
    expect(r.pagandoTotal).toEqual({ totalPago: 1000, juros: 0 });
  });
  it('RN05: teto legal — juros limitados a 100% do saldo do rotativo (parcelas somam 2 × saldo)', () => {
    const r = simularFatura({ ...base, taxaParcelamentoPercentual: 12, parcelas: 24 });
    expect(r.tetoAplicado).toBe(true);
    expect(centavos(r.pagandoMinimo.parcela)).toBe(7083);
    expect(centavos(r.pagandoMinimo.somaParcelas)).toBe(170000);
    expect(centavos(r.pagandoMinimo.juros)).toBe(85000);
    expect(centavos(r.pagandoMinimo.totalPago)).toBe(185000);
    expect(r.taxaParcelamentoEfetiva * 100).toBeCloseTo(5.0, 2);
  });
  it('RN05: parcelamento com taxa 0', () => {
    const r = simularFatura({ valorFatura: 1000, pagamentoMinimo: 150, taxaRotativoPercentual: 10, taxaParcelamentoPercentual: 0, parcelas: 10 });
    expect(centavos(r.pagandoMinimo.parcela)).toBe(9350);
    expect(centavos(r.pagandoMinimo.totalPago)).toBe(108500);
    expect(centavos(r.pagandoMinimo.juros)).toBe(8500);
  });
  it('RN05: tabela com o mês 0, o mês 1 no rotativo e uma linha por parcela, até saldo zero', () => {
    const r = simularFatura({ ...base, taxaParcelamentoPercentual: 9, parcelas: 12 });
    expect(r.tabela).toHaveLength(14);
    expect(r.tabela[0]).toMatchObject({ mes: 0, situacao: 'Pagamento mínimo', pagamento: 150, juros: 0, saldo: 850 });
    expect(r.tabela[1]).toMatchObject({ mes: 1, situacao: 'Rotativo (até a próxima fatura)', pagamento: 0 });
    expect(r.tabela[13]).toMatchObject({ mes: 13, situacao: 'Parcela 12 de 12', saldo: 0 });
  });
  it('RN05: mínimo maior ou igual à fatura não tem rotativo', () => {
    expect(() => simularFatura({ ...base, pagamentoMinimo: 1000, taxaParcelamentoPercentual: 9, parcelas: 12 })).toThrow(ErroSemRotativo);
  });
});
