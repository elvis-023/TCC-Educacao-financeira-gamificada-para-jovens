import type { FormaTeste, TipoTeste } from '@/dados/tipos';

export const TOTAL_PERGUNTAS = 3;

export const formaDoTeste = (tipo: TipoTeste): FormaTeste => (tipo === 'pre' ? 'A' : 'B');
export const percentualDeAcerto = (nota: number, totalPerguntas: number) => (nota / totalPerguntas) * 100;
/** Diferença pós − pré, em pontos percentuais. */
export const diferencaPp = (notaPre: number, notaPos: number, totalPerguntas: number) =>
  percentualDeAcerto(notaPos, totalPerguntas) - percentualDeAcerto(notaPre, totalPerguntas);
