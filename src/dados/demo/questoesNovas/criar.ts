import type { Nivel, Questao } from '@/dados/tipos';
import { BASE_POR_LICAO } from '../estruturaQuestoes';

const DATA = '2026-11-01T12:00:00.000Z';

/** [nível, enunciado, alternativa correta, 3 alternativas erradas, explicação]. O id e a posição da correta saem do montador. */
export type Item = ['f' | 'm' | 'd', string, string, [string, string, string], string];

const NIVEL: Record<Item[0], Nivel> = { f: 'facil', m: 'medio', d: 'dificil' };

function permutacoes(itens: number[]): number[][] {
  if (itens.length <= 1) return [itens];
  return itens.flatMap((x, i) => permutacoes([...itens.slice(0, i), ...itens.slice(i + 1)]).map((resto) => [x, ...resto]));
}
const PERMUTACOES = permutacoes([0, 1, 2, 3]);

// Em cada bloco de 4 questões a alternativa correta ocupa as 4 posições, e as 24 ordens possíveis se alternam:
// no fim, A, B, C e D têm exatamente a mesma quantidade de corretas, sem padrão que dê para decorar.
let contador = 0;
const proximaPosicao = (): 0 | 1 | 2 | 3 => {
  const bloco = Math.floor(contador / 4);
  const posicao = PERMUTACOES[(bloco * 5 + 3) % PERMUTACOES.length][contador % 4];
  contador += 1;
  return posicao as 0 | 1 | 2 | 3;
};

/** Monta as questões novas de uma lição; os ids continuam a numeração das questões que já existiam (f2, f3…, m4…). */
export function questoesDaLicao(licaoId: string, ordem: 1 | 2 | 3, itens: Item[]): Questao[] {
  const proximo: Record<Item[0], number> = {
    f: BASE_POR_LICAO[ordem].facil + 1, m: BASE_POR_LICAO[ordem].medio + 1, d: BASE_POR_LICAO[ordem].dificil + 1,
  };
  return itens.map(([nivel, enunciado, correta, erradas, explicacao]) => {
    const posicao = proximaPosicao();
    const alternativas = [...erradas];
    alternativas.splice(posicao, 0, correta);
    const id = `${licaoId}-${nivel}${proximo[nivel]++}`;
    return {
      id, quizId: `${licaoId}-quiz`, enunciado, alternativas: alternativas as Questao['alternativas'], respostaCorreta: posicao,
      nivelDificuldade: NIVEL[nivel], explicacao, ativa: true, criadoEm: DATA, atualizadoEm: DATA,
    };
  });
}

// ---- Formatação e contas usadas para calcular números e erros típicos (nada é digitado "de cabeça") ----
const numero = (valor: number, casas: number) => valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
/** R$ 1.234,56 */
export const r = (valor: number) => `R$ ${numero(valor, 2)}`;
/** 12,68% (duas casas) */
export const pc = (valor: number, casas = 2) => `${numero(valor, casas)}%`;
export const n = (valor: number, casas = 0) => numero(valor, casas);
/** Parcela fixa da tabela Price: saldo, taxa por período (fração) e número de parcelas. */
export const parcelaPrice = (saldo: number, taxa: number, parcelas: number) => (saldo * taxa) / (1 - Math.pow(1 + taxa, -parcelas));
/** Montante com aporte no fim de cada período (RN01). */
export const montante = (inicial: number, aporte: number, taxa: number, periodos: number) =>
  inicial * Math.pow(1 + taxa, periodos) + (taxa === 0 ? aporte * periodos : (aporte * (Math.pow(1 + taxa, periodos) - 1)) / taxa);
export const arredondar = (valor: number) => Math.round(valor * 100) / 100;
