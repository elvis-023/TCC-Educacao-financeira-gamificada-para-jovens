import type { RepositorioTreino } from '../contratos';
import { cliente, traduzirErro } from './comum';

// Funções do banco (`estado_treino`, `proxima_questao_treino` e `responder_treino`): a resposta correta só sai depois de responder.
async function chamar<T>(nome: string, argumentos?: Record<string, unknown>): Promise<T> {
  const { data, error } = await cliente().rpc(nome, argumentos);
  if (error) throw new Error(traduzirErro(error));
  return data as T;
}

export const treinoSupabase: RepositorioTreino = {
  estado: () => chamar('estado_treino'),
  proximaQuestao: (jaVistas) => chamar('proxima_questao_treino', { p_ja_vistas: jaVistas }),
  responder: (questaoId, alternativa) => chamar('responder_treino', { p_questao_id: questaoId, p_alternativa: alternativa }),
};
