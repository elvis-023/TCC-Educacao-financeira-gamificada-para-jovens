import type { Nivel } from '@/dados/tipos';
import { XP_POR_NIVEL } from './gamificacao';

/** Modo Treino: revisão repetível, separada do percurso das trilhas (não mexe no nível adaptativo, nas conquistas nem na pesquisa). */
export const QUESTOES_POR_TREINO = 5;
export const TETO_XP_TREINO_DIARIO = 40;
const FRACAO_DO_XP_DO_QUIZ = 0.2;

/** Acerto vale 20% do XP do quiz (arredondado); erro não vale XP. */
export const xpDoTreino = (nivel: Nivel, acertou: boolean) => (acertou ? Math.round(XP_POR_NIVEL[nivel] * FRACAO_DO_XP_DO_QUIZ) : 0);

/** Quanto do XP entra de fato, respeitando o teto do dia (dia em São Paulo). */
export const xpConcedidoNoTreino = (xp: number, xpJaGanhoHoje: number) => Math.max(0, Math.min(xp, TETO_XP_TREINO_DIARIO - xpJaGanhoHoje));

/** Entre as questões ainda não vistas nesta sessão, sorteia uma das menos treinadas. */
export function escolherQuestaoTreino(candidatas: { id: string; vezes: number }[], jaVistas: string[], aleatorio: () => number): string | null {
  const livres = candidatas.filter((c) => !jaVistas.includes(c.id));
  if (livres.length === 0) return null;
  const menor = Math.min(...livres.map((c) => c.vezes));
  const empatadas = livres.filter((c) => c.vezes === menor);
  return empatadas[Math.floor(aleatorio() * empatadas.length)].id;
}
