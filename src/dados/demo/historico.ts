import type { Nivel, Progresso, RespostaQuiz, UsuarioBadge } from '@/dados/tipos';
import { instanteRelativo } from '@/lib/fuso';
import { QUESTOES } from './questoes';
import { ID_ALEX } from './usuarios';

type Linha = [questaoId: string, nivelQuestao: Nivel, acertou: boolean, nivelTrilhaApos: Nivel];

const QUIZZES_DO_ALEX: { diasAtras: number; horaLeitura: [number, number]; licaoId: string; respostas: Linha[] }[] = [
  { diasAtras: 4, horaLeitura: [19, 0], licaoId: 'orcamento-pessoal-1', respostas: [
    ['orcamento-pessoal-1-m1', 'medio', true, 'medio'],
    ['orcamento-pessoal-1-m2', 'medio', false, 'medio'],
    ['orcamento-pessoal-1-m3', 'medio', false, 'medio'],
  ] },
  { diasAtras: 3, horaLeitura: [19, 0], licaoId: 'orcamento-pessoal-2', respostas: [
    ['orcamento-pessoal-2-m1', 'medio', true, 'medio'],
    ['orcamento-pessoal-2-m2', 'medio', false, 'facil'],
    ['orcamento-pessoal-2-f1', 'facil', true, 'facil'],
  ] },
  { diasAtras: 2, horaLeitura: [19, 0], licaoId: 'orcamento-pessoal-3', respostas: [
    ['orcamento-pessoal-3-f1', 'facil', true, 'facil'],
    ['orcamento-pessoal-1-f1', 'facil', true, 'medio'],
    ['orcamento-pessoal-3-m1', 'medio', false, 'medio'],
  ] },
  { diasAtras: 1, horaLeitura: [19, 48], licaoId: 'juros-compostos-1', respostas: [
    ['juros-compostos-1-m1', 'medio', true, 'medio'],
    ['juros-compostos-1-m2', 'medio', false, 'medio'],
    ['juros-compostos-1-m3', 'medio', true, 'medio'],
  ] },
];

const XP: Record<Nivel, number> = { facil: 10, medio: 20, dificil: 35 };

/** Alternativa coerente com o resultado: a correta quando acertou; outra quando errou. */
const marcada = (id: string, acertou: boolean) => {
  const questao = QUESTOES.find((x) => x.id === id)!;
  return acertou ? questao.respostaCorreta : (questao.respostaCorreta + 1) % 4;
};

export function criarHistoricoDoAlex(agora: Date): { progressos: Progresso[]; respostasQuiz: RespostaQuiz[]; usuarioBadges: UsuarioBadge[] } {
  const progressos: Progresso[] = [];
  const respostasQuiz: RespostaQuiz[] = [];
  for (const q of QUIZZES_DO_ALEX) {
    const trilhaId = q.licaoId.replace(/-\d$/, '');
    const [h, m] = q.horaLeitura;
    let acertos = 0;
    let xpQuiz = 0;
    q.respostas.forEach(([questaoId, nivelQuestao, acertou, nivelTrilhaApos], i) => {
      const xpGanho = acertou ? XP[nivelQuestao] : 2;
      acertos += acertou ? 1 : 0;
      xpQuiz += xpGanho;
      respostasQuiz.push({
        id: `demo-resposta-${questaoId}`, usuarioId: ID_ALEX, quizId: `${q.licaoId}-quiz`, questaoId, trilhaId, nivelQuestao,
        alternativaMarcada: marcada(questaoId, acertou), acertou, xpGanho, nivelTrilhaApos, respondidaEm: instanteRelativo(agora, q.diasAtras, h, m + 10 + i),
      });
    });
    progressos.push({
      id: `demo-progresso-${q.licaoId}`, usuarioId: ID_ALEX, trilhaId, licaoId: q.licaoId,
      leituraConcluidaEm: instanteRelativo(agora, q.diasAtras, h, m), quizConcluidoEm: instanteRelativo(agora, q.diasAtras, h, m + 12),
      acertos, xpGanho: xpQuiz, sincronizadoOffline: true,
    });
  }
  const usuarioBadges: UsuarioBadge[] = [
    { usuarioId: ID_ALEX, badgeId: 'primeiro_quiz', conquistadoEm: instanteRelativo(agora, 4, 19, 12) },
    { usuarioId: ID_ALEX, badgeId: 'primeira_trilha', conquistadoEm: instanteRelativo(agora, 2, 19, 12) },
  ];
  return { progressos, respostasQuiz, usuarioBadges };
}
