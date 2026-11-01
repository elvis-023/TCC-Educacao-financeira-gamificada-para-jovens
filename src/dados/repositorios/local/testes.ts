import { lerAparelho } from '@/dados/aparelho';
import { alterarBanco, carregarBanco } from '@/dados/bancoLocal';
import { PERGUNTAS_DIAGNOSTICAS, VERSAO_TESTE } from '@/dados/demo/perguntasDiagnosticas';
import { TRILHAS } from '@/dados/demo/trilhas';
import type { ResumoTeste, TesteDiagnostico } from '@/dados/tipos';
import { agora } from '@/lib/relogio';
import { formaDoTeste } from '@/regras/pesquisa';
import { trilhasConcluidas } from '@/regras/progresso';
import type { RepositorioTestes } from '../contratos';
import { responder, usuarioDaSessao } from './comum';

export function resumosDoUsuario(usuarioId: string): ResumoTeste[] {
  const banco = carregarBanco();
  const pseudonimo = banco.pseudonimos[usuarioId];
  return banco.testes
    .filter((t) => t.pseudonimo === pseudonimo)
    .map((t) => ({
      tipoTeste: t.tipoTeste, forma: t.forma, versao: t.versao, iniciadoEm: t.iniciadoEm, concluidoEm: t.concluidoEm,
      pontuacaoTotal: t.pontuacaoTotal, respondidas: banco.respostasTeste.filter((r) => r.testeId === t.id).length,
    }));
}

export const testesLocal: RepositorioTestes = {
  meusTestes: () => responder(resumosDoUsuario(usuarioDaSessao())),

  async iniciar(tipo) {
    const usuarioId = usuarioDaSessao();
    const forma = formaDoTeste(tipo);
    const teste = alterarBanco((banco) => {
      const pseudonimo = banco.pseudonimos[usuarioId];
      if (!pseudonimo) throw new Error('O administrador não faz os testes');
      const doUsuario = banco.testes.filter((t) => t.pseudonimo === pseudonimo);
      if (tipo === 'pos') {
        if (!doUsuario.some((t) => t.tipoTeste === 'pre' && t.concluidoEm)) throw new Error('Faça o teste inicial primeiro');
        const meus = banco.progressos.filter((p) => p.usuarioId === usuarioId);
        if (trilhasConcluidas(meus) < TRILHAS.length && !lerAparelho().posTesteLiberadoDemo) {
          throw new Error('Conclua as 4 trilhas para liberar o teste final');
        }
      }
      const existente = doUsuario.find((t) => t.tipoTeste === tipo);
      if (existente) return existente;
      const novo: TesteDiagnostico = {
        id: crypto.randomUUID(), pseudonimo, tipoTeste: tipo, forma, versao: VERSAO_TESTE,
        iniciadoEm: agora().toISOString(), concluidoEm: null, pontuacaoTotal: null,
      };
      banco.testes.push(novo);
      return novo;
    });
    const banco = carregarBanco();
    return responder({
      resumo: resumosDoUsuario(usuarioId).find((r) => r.tipoTeste === tipo)!,
      perguntas: PERGUNTAS_DIAGNOSTICAS.filter((p) => p.forma === teste.forma && p.versao === teste.versao)
        .sort((a, b) => a.numero - b.numero)
        .map(({ id, numero, enunciado, alternativas }) => ({ id, numero, enunciado, alternativas })),
      respondidas: banco.respostasTeste.filter((r) => r.testeId === teste.id).map((r) => r.perguntaId),
    });
  },

  async responder(tipo, perguntaId, alternativa) {
    const usuarioId = usuarioDaSessao();
    const concluido = alterarBanco((banco) => {
      const teste = banco.testes.find((t) => t.pseudonimo === banco.pseudonimos[usuarioId] && t.tipoTeste === tipo);
      if (!teste) throw new Error('Teste não iniciado');
      if (teste.concluidoEm) throw new Error('Teste já concluído');
      const pergunta = PERGUNTAS_DIAGNOSTICAS.find((p) => p.id === perguntaId && p.forma === teste.forma && p.versao === teste.versao);
      if (!pergunta) throw new Error('Pergunta não pertence a este teste');
      if (!banco.respostasTeste.some((r) => r.testeId === teste.id && r.perguntaId === perguntaId)) {
        banco.respostasTeste.push({
          id: crypto.randomUUID(), testeId: teste.id, perguntaId, alternativaMarcada: alternativa,
          acertou: alternativa === pergunta.alternativaCorreta, respondidaEm: agora().toISOString(),
        });
      }
      const respostas = banco.respostasTeste.filter((r) => r.testeId === teste.id);
      const total = PERGUNTAS_DIAGNOSTICAS.filter((p) => p.forma === teste.forma && p.versao === teste.versao).length;
      if (respostas.length < total) return false;
      teste.concluidoEm = agora().toISOString();
      teste.pontuacaoTotal = respostas.filter((r) => r.acertou).length;
      return true;
    });
    return responder({ concluido }); // nunca devolve se acertou (é medição, não quiz)
  },
};
