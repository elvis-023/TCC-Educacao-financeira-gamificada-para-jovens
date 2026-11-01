import type { RepositorioUsuario } from '../contratos';
import { cliente, traduzirErro, usuarioLogadoId } from './comum';
import { paraUsuario } from './mapear';

export const usuarioSupabase: RepositorioUsuario = {
  async meuUsuario() {
    const { data: sessao } = await cliente().auth.getSession();
    const id = await usuarioLogadoId();
    const { data, error } = await cliente().from('usuarios').select('*').eq('id', id).single();
    if (error) throw new Error(traduzirErro(error));
    return paraUsuario(data, sessao.session?.user.email ?? '');
  },
  async definirReceberLembretes(valor) {
    const id = await usuarioLogadoId();
    const { error } = await cliente().from('usuarios').update({ receber_lembretes: valor }).eq('id', id);
    if (error) throw new Error(traduzirErro(error));
  },
};
