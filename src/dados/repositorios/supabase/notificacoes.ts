import type { RepositorioNotificacoes } from '../contratos';
import { cliente, traduzirErro } from './comum';
import { paraNotificacao } from './mapear';

export const notificacoesSupabase: RepositorioNotificacoes = {
  async minhasNotificacoes() {
    const { data, error } = await cliente().from('notificacoes').select('*').order('data_envio', { ascending: false });
    if (error) throw new Error(traduzirErro(error));
    return (data ?? []).map(paraNotificacao);
  },
};
