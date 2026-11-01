import type { RepositorioSessao } from '../contratos';
import { cliente, traduzirErro } from './comum';

export const MENSAGEM_CONFIRMAR_EMAIL = 'Enviamos um link de confirmação para o seu e-mail. Confirme e depois entre.';

export const sessaoSupabase: RepositorioSessao = {
  async sessaoAtual() {
    const { data } = await cliente().auth.getSession();
    const usuario = data.session?.user;
    if (!usuario) return null;
    const { data: linha, error } = await cliente().from('usuarios').select('papel, nome').eq('id', usuario.id).single();
    if (error) throw new Error(traduzirErro(error));
    return { usuarioId: usuario.id, papel: linha.papel, nome: linha.nome };
  },
  observar(aoMudar) {
    const { data } = cliente().auth.onAuthStateChange((evento) => {
      // Fora do callback: chamar o Supabase de dentro dele pode travar.
      if (evento !== 'TOKEN_REFRESHED') setTimeout(aoMudar, 0);
    });
    return () => data.subscription.unsubscribe();
  },
  async cadastrar({ nome, email, senha, tcleVersao }) {
    const { data, error } = await cliente().auth.signUp({
      email, password: senha,
      options: { data: { nome, aceite_tcle: true, aceite_privacidade: true, maioridade: true, tcle_versao: tcleVersao } },
    });
    if (error) throw new Error(traduzirErro(error));
    // Sem sessão: o projeto exige confirmar o e-mail antes do primeiro acesso.
    if (!data.session) throw new Error(MENSAGEM_CONFIRMAR_EMAIL);
  },
  async entrar(email, senha) {
    const { error } = await cliente().auth.signInWithPassword({ email, password: senha });
    if (error) throw new Error(traduzirErro(error));
  },
  async entrarDemonstracao() {
    throw new Error('Os atalhos de demonstração existem só no modo local');
  },
  async sair() {
    await cliente().auth.signOut();
  },
  async pedirNovaSenha(email) {
    // A confirmação na tela é sempre a mesma, exista ou não a conta (PRD T04).
    await cliente().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/redefinir-senha` });
  },
  async definirNovaSenha(senha) {
    const { error } = await cliente().auth.updateUser({ password: senha });
    if (error) throw new Error(traduzirErro(error));
  },
};
