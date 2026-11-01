import { atualizarAparelho, assinarAparelho, lerAparelho } from '@/dados/aparelho';
import { alterarBanco, carregarBanco } from '@/dados/bancoLocal';
import { ID_ADMIN, ID_ALEX } from '@/dados/demo/usuarios';
import { agora } from '@/lib/relogio';
import type { RepositorioSessao } from '../contratos';
import { gerarPseudonimoLocal, responder } from './comum';

// A senha não é guardada nem conferida nesta etapa (PRD 7.5, decisão 7).
export const sessaoLocal: RepositorioSessao = {
  async sessaoAtual() {
    const id = lerAparelho().sessaoUsuarioId;
    const usuario = id ? carregarBanco().usuarios.find((u) => u.id === id) : undefined;
    return responder(usuario ? { usuarioId: usuario.id, papel: usuario.papel, nome: usuario.nome } : null);
  },
  observar: (aoMudar) => assinarAparelho(aoMudar),
  async cadastrar({ nome, email, tcleVersao }) {
    const emailNormalizado = email.trim().toLowerCase();
    const instante = agora().toISOString();
    alterarBanco((banco) => {
      if (banco.usuarios.some((u) => u.email.toLowerCase() === emailNormalizado)) throw new Error('Já existe uma conta com este e-mail');
      const id = crypto.randomUUID();
      banco.usuarios.push({
        id, nome: nome.trim(), email: emailNormalizado, papel: 'jovem', xpTotal: 0, diasStreak: 0, ultimoDiaUso: null,
        ultimaAtividadeEm: null, receberLembretes: true, tcleVersao, tcleAceitoEm: instante, privacidadeAceitaEm: instante,
        maioridadeDeclaradaEm: instante, criadoEm: instante,
      });
      banco.pseudonimos[id] = gerarPseudonimoLocal(Object.values(banco.pseudonimos));
      atualizarAparelho({ sessaoUsuarioId: id });
    });
    await responder(null);
  },
  async entrar(email) {
    const usuario = carregarBanco().usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!usuario) throw new Error('E-mail ou senha incorretos');
    atualizarAparelho({ sessaoUsuarioId: usuario.id });
    await responder(null);
  },
  async entrarDemonstracao(papel) {
    atualizarAparelho({ sessaoUsuarioId: papel === 'admin' ? ID_ADMIN : ID_ALEX });
    await responder(null);
  },
  async sair() {
    atualizarAparelho({ sessaoUsuarioId: null });
    await responder(null);
  },
  async pedirNovaSenha() {
    await responder(null); // confirmação simulada (PRD T04)
  },
  async definirNovaSenha() {
    throw new Error('Disponível só com a base de dados');
  },
};
