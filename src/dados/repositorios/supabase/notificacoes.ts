import type { RepositorioNotificacoes } from '../contratos';
import { cliente, iso, traduzirErro, usuarioLogadoId } from './comum';
import { paraNotificacao } from './mapear';

export const notificacoesSupabase: RepositorioNotificacoes = {
  async minhasNotificacoes() {
    const { data, error } = await cliente().from('notificacoes').select('*').order('data_envio', { ascending: false });
    if (error) throw new Error(traduzirErro(error));
    return (data ?? []).map(paraNotificacao);
  },

  async marcarComoLida(id) {
    const { error } = await cliente().from('notificacoes').update({ lida: true }).eq('id', Number(id));
    if (error) throw new Error(traduzirErro(error));
  },

  async marcarTodasComoLidas() {
    const { error } = await cliente().from('notificacoes').update({ lida: true }).eq('usuario_id', await usuarioLogadoId()).eq('lida', false);
    if (error) throw new Error(traduzirErro(error));
  },

  // A função do banco decide se já passou o limite de inatividade e grava o lembrete uma vez por período (RF09, RN04).
  async verificarLembrete() {
    const { data, error } = await cliente().rpc('gerar_lembrete');
    if (error) throw new Error(traduzirErro(error));
    if (!data) return null;
    const n = data as { id: string; usuarioId: string; tipo: 'lembrete'; mensagem: string; link: string | null; dataEnvio: string; lida: boolean };
    return { ...n, dataEnvio: iso(n.dataEnvio)! };
  },
};
