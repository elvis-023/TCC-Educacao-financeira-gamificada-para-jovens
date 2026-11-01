import type { Badge, CodigoBadge, LinhaRanking, Nivel } from '@/dados/tipos';
import { inicioDaSemana } from '@/lib/fuso';

export const XP_POR_NIVEL: Record<Nivel, number> = { facil: 10, medio: 20, dificil: 35 };
export const XP_ERRO = 2;

/** RN03: acerto vale pelo nível da questão; erro vale 2 de participação. */
export const xpPorResposta = (nivelQuestao: Nivel, acertou: boolean) => (acertou ? XP_POR_NIVEL[nivelQuestao] : XP_ERRO);

// ---- Conquistas (RF08) ----

export const DIAS_PARA_SEQUENCIA = 7;
export const LICOES_POR_TRILHA = 3;
export const TOTAL_TRILHAS_MESTRE = 4;

/** Retrato do jovem, já contando o quiz que acabou de ser concluído. */
export interface SituacaoConquistas {
  quizzesConcluidos: number;
  trilhasConcluidas: number;
  maiorNumeroDeLicoesNumaTrilha: number;
  sequenciaDias: number;
  acertosNoQuiz: number;
  questoesNoQuiz: number;
  chegouAoDificil: boolean;
  jaConquistadas: CodigoBadge[];
}

const CRITERIOS: Record<CodigoBadge, (s: SituacaoConquistas) => boolean> = {
  primeiro_quiz: (s) => s.quizzesConcluidos >= 1,
  primeira_trilha: (s) => s.trilhasConcluidas >= 1,
  sequencia_7_dias: (s) => s.sequenciaDias >= DIAS_PARA_SEQUENCIA,
  gabaritou: (s) => s.questoesNoQuiz > 0 && s.acertosNoQuiz === s.questoesNoQuiz,
  desafio_aceito: (s) => s.chegouAoDificil,
  mestre_das_financas: (s) => s.trilhasConcluidas >= TOTAL_TRILHAS_MESTRE,
};

const ORDEM: CodigoBadge[] = ['primeiro_quiz', 'primeira_trilha', 'sequencia_7_dias', 'gabaritou', 'desafio_aceito', 'mestre_das_financas'];

/** RF08: as conquistas atingidas agora e ainda não concedidas (nunca duplica). */
export function verificarConquistas(situacao: SituacaoConquistas): CodigoBadge[] {
  return ORDEM.filter((codigo) => !situacao.jaConquistadas.includes(codigo) && CRITERIOS[codigo](situacao));
}

/** Texto de progresso de uma conquista bloqueada (PRD 2.8). */
export function textoDeProgresso(codigo: CodigoBadge, s: SituacaoConquistas): string {
  switch (codigo) {
    case 'primeiro_quiz':
      return '0 de 1 quiz';
    case 'primeira_trilha':
      return `${Math.min(s.maiorNumeroDeLicoesNumaTrilha, LICOES_POR_TRILHA)} de ${LICOES_POR_TRILHA} lições`;
    case 'sequencia_7_dias':
      return `${Math.min(s.sequenciaDias, DIAS_PARA_SEQUENCIA)} de ${DIAS_PARA_SEQUENCIA} dias`;
    case 'gabaritou':
      return 'Falta acertar as 3 questões de um quiz';
    case 'desafio_aceito':
      return 'Falta chegar ao nível Difícil';
    case 'mestre_das_financas':
      return `${Math.min(s.trilhasConcluidas, TOTAL_TRILHAS_MESTRE)} de ${TOTAL_TRILHAS_MESTRE} trilhas`;
  }
}

/** A primeira conquista ainda bloqueada, na ordem da lista, com o progresso. */
export function proximaConquista(
  badges: Badge[],
  conquistadas: CodigoBadge[],
  situacao: SituacaoConquistas,
): { badge: Badge; progresso: string } | null {
  const badge = [...badges].sort((a, b) => a.ordem - b.ordem).find((b) => !conquistadas.includes(b.id));
  return badge ? { badge, progresso: textoDeProgresso(badge.id, situacao) } : null;
}

// ---- Ranking (RF07, RNF04) ----

/** RNF04: o ranking mostra o primeiro nome e a inicial do último sobrenome. */
export function nomeDeExibicao(nomeCompleto: string): string {
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.`;
}

export interface EntradaRanking { usuarioId: string; nome: string; xp: number }

/** Ordem por XP; empate na mesma posição (1, 2, 2, 4), em ordem alfabética. */
export function montarRanking(entradas: EntradaRanking[], usuarioId: string | null): LinhaRanking[] {
  const ordenadas = [...entradas].sort((a, b) => b.xp - a.xp || a.nome.localeCompare(b.nome, 'pt-BR'));
  let posicao = 0;
  return ordenadas.map((e, i) => {
    if (i === 0 || e.xp !== ordenadas[i - 1].xp) posicao = i + 1;
    return { posicao, nomeExibicao: nomeDeExibicao(e.nome), xp: e.xp, ehVoce: e.usuarioId === usuarioId };
  });
}

/** XP ganho desde a segunda-feira 00h00 (São Paulo) da semana de `agora`. */
export function xpDaSemana(respostas: { xpGanho: number; respondidaEm: string }[], agora: Date): number {
  const inicio = inicioDaSemana(agora).getTime();
  return respostas.filter((r) => new Date(r.respondidaEm).getTime() >= inicio).reduce((soma, r) => soma + r.xpGanho, 0);
}
