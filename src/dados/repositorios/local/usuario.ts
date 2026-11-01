import { alterarBanco, carregarBanco } from '@/dados/bancoLocal';
import type { RepositorioUsuario } from '../contratos';
import { responder, usuarioDaSessao } from './comum';

export const usuarioLocal: RepositorioUsuario = {
  async meuUsuario() {
    const usuario = carregarBanco().usuarios.find((u) => u.id === usuarioDaSessao());
    if (!usuario) throw new Error('Usuário não encontrado');
    return responder(usuario);
  },
  async definirReceberLembretes(valor) {
    const id = usuarioDaSessao();
    alterarBanco((banco) => {
      banco.usuarios.find((u) => u.id === id)!.receberLembretes = valor;
    });
    await responder(null);
  },
};
