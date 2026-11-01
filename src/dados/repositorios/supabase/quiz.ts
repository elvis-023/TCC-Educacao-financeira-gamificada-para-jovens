import type { QuestaoPublica, ResultadoResposta } from '@/dados/tipos';
import type { RepositorioQuiz } from '../contratos';
import { cliente, traduzirErro } from './comum';

// O sorteio, a correção, o nível e o XP rodam no servidor (funções proxima_questao e responder_questao).
export const quizSupabase: RepositorioQuiz = {
  async proximaQuestao(quizId) {
    const { data, error } = await cliente().rpc('proxima_questao', { p_quiz_id: quizId });
    if (error) throw new Error(traduzirErro(error));
    return (data as QuestaoPublica | null) ?? null;
  },
  async responder(quizId, questaoId, alternativa) {
    const { data, error } = await cliente().rpc('responder_questao', { p_quiz_id: quizId, p_questao_id: questaoId, p_alternativa: alternativa });
    if (error) throw new Error(traduzirErro(error));
    return data as ResultadoResposta;
  },
};
