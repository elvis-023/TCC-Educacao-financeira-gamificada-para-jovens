// O passo 14 acrescenta as conquistas e o passo 15, o ranking.
import type { Nivel } from '@/dados/tipos';

export const XP_POR_NIVEL: Record<Nivel, number> = { facil: 10, medio: 20, dificil: 35 };
export const XP_ERRO = 2;

/** RN03: acerto vale pelo nível da questão; erro vale 2 de participação. */
export const xpPorResposta = (nivelQuestao: Nivel, acertou: boolean) => (acertou ? XP_POR_NIVEL[nivelQuestao] : XP_ERRO);
