import type { RepositorioProgresso } from '../contratos';
import { cliente, traduzirErro, usuarioLogadoId } from './comum';
import { paraProgresso, paraResposta } from './mapear';

export const progressoSupabase: RepositorioProgresso = {
  async meusProgressos() {
    const id = await usuarioLogadoId();
    const { data, error } = await cliente().from('progresso').select('*').eq('usuario_id', id);
    if (error) throw new Error(traduzirErro(error));
    return (data ?? []).map(paraProgresso);
  },
  async minhasRespostas() {
    const id = await usuarioLogadoId();
    const { data, error } = await cliente().from('respostas_quiz').select('*').eq('usuario_id', id).order('respondida_em').order('id');
    if (error) throw new Error(traduzirErro(error));
    return (data ?? []).map(paraResposta);
  },
  async concluirLeitura(licaoId) {
    const { error } = await cliente().rpc('concluir_leitura', { p_licao_id: licaoId });
    if (error) throw new Error(traduzirErro(error));
  },
  // No modo Supabase não há fila offline: tudo grava direto no servidor.
  sincronizarPendentes: async () => 0,
};
