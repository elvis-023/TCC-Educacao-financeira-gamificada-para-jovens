import type { PerguntaPublica, ResumoTeste } from '@/dados/tipos';
import type { RepositorioTestes } from '../contratos';
import { cliente, traduzirErro } from './comum';
import { paraResumoTeste } from './mapear';

// O pseudônimo é calculado no servidor; o app nunca o vê nem recebe a resposta correta (RNF06).
export const testesSupabase: RepositorioTestes = {
  async meusTestes() {
    const { data, error } = await cliente().rpc('meus_testes');
    if (error) throw new Error(traduzirErro(error));
    return ((data ?? []) as unknown[]).map(paraResumoTeste);
  },
  async iniciar(tipo) {
    const { data, error } = await cliente().rpc('iniciar_teste', { p_tipo: tipo });
    if (error) throw new Error(traduzirErro(error));
    const aberto = data as { resumo: ResumoTeste; perguntas: PerguntaPublica[]; respondidas: string[] };
    return { resumo: paraResumoTeste(aberto.resumo), perguntas: aberto.perguntas, respondidas: aberto.respondidas };
  },
  async responder(tipo, perguntaId, alternativa) {
    const { data, error } = await cliente().rpc('registrar_resposta_teste', { p_tipo: tipo, p_pergunta_id: perguntaId, p_alternativa: alternativa });
    if (error) throw new Error(traduzirErro(error));
    return { concluido: Boolean((data as { concluido: boolean }).concluido) };
  },
};
