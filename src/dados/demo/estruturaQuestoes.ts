import type { Nivel } from '@/dados/tipos';
import { LICOES } from './trilhas';

/** 4 questões por lição — lição 1: 1 Fácil e 3 Médio; lição 2: 1 Fácil, 2 Médio e 1 Difícil; lição 3: 1 Fácil, 1 Médio e 2 Difícil. */
export const SUFIXOS_POR_LICAO: Record<1 | 2 | 3, [sufixo: string, nivel: Nivel][]> = {
  1: [['f1', 'facil'], ['m1', 'medio'], ['m2', 'medio'], ['m3', 'medio']],
  2: [['f1', 'facil'], ['m1', 'medio'], ['m2', 'medio'], ['d1', 'dificil']],
  3: [['f1', 'facil'], ['m1', 'medio'], ['d1', 'dificil'], ['d2', 'dificil']],
};

export interface ItemEstrutura { id: string; quizId: string; trilhaId: string; licaoOrdem: number; nivel: Nivel }

export const ESTRUTURA_QUESTOES: ItemEstrutura[] = LICOES.flatMap((licao) =>
  SUFIXOS_POR_LICAO[licao.ordem].map(([sufixo, nivel]) => ({
    id: `${licao.id}-${sufixo}`, quizId: `${licao.id}-quiz`, trilhaId: licao.trilhaId, licaoOrdem: licao.ordem, nivel,
  })),
);
