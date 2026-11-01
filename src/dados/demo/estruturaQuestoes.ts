import type { Nivel } from '@/dados/tipos';
import { LICOES } from './trilhas';

/**
 * 28 questões por lição (336 no banco, 84 por trilha: 21 Fácil, 42 Médio e 21 Difícil).
 * Quanto mais adiante a lição, mais difícil o conjunto: o quiz pode sortear questões da lição atual e das anteriores,
 * e o motor adaptativo precisa de questões de cada nível para subir ou descer.
 */
export const TOTAL_POR_NIVEL: Record<1 | 2 | 3, Record<Nivel, number>> = {
  1: { facil: 9, medio: 16, dificil: 3 },
  2: { facil: 6, medio: 14, dificil: 8 },
  3: { facil: 6, medio: 12, dificil: 10 },
};

/** As 4 questões do primeiro banco (PRD 6.6): ficam com os mesmos ids, porque o histórico de demonstração aponta para elas. */
export const BASE_POR_LICAO: Record<1 | 2 | 3, Record<Nivel, number>> = {
  1: { facil: 1, medio: 3, dificil: 0 },
  2: { facil: 1, medio: 2, dificil: 1 },
  3: { facil: 1, medio: 1, dificil: 2 },
};

const LETRA: Record<Nivel, string> = { facil: 'f', medio: 'm', dificil: 'd' };
const NIVEIS: Nivel[] = ['facil', 'medio', 'dificil'];

export const SUFIXOS_POR_LICAO = Object.fromEntries(
  ([1, 2, 3] as const).map((ordem) => [
    ordem,
    NIVEIS.flatMap((nivel) => Array.from({ length: TOTAL_POR_NIVEL[ordem][nivel] }, (_, i) => [`${LETRA[nivel]}${i + 1}`, nivel] as [string, Nivel])),
  ]),
) as Record<1 | 2 | 3, [sufixo: string, nivel: Nivel][]>;

const SUFIXOS_BASE: Record<1 | 2 | 3, [sufixo: string, nivel: Nivel][]> = {
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

/** Estrutura do primeiro banco (4 questões por lição): serve para testar o motor adaptativo escolha a escolha. */
export const ESTRUTURA_QUESTOES_BASE: ItemEstrutura[] = LICOES.flatMap((licao) =>
  SUFIXOS_BASE[licao.ordem as 1 | 2 | 3].map(([sufixo, nivel]) => ({
    id: `${licao.id}-${sufixo}`, quizId: `${licao.id}-quiz`, trilhaId: licao.trilhaId, licaoOrdem: licao.ordem, nivel,
  })),
);
