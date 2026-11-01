import type { ChaveParametro, LinhaExportacao, LinhaHistoricoParametro, MetricasPesquisa, QuestaoAdmin } from '@/dados/tipos';
import type { RepositorioAdmin } from '../contratos';
import { cliente, iso, traduzirErro } from './comum';

/* eslint-disable @typescript-eslint/no-explicit-any -- linhas cruas do PostgREST; o tipo final é o do app */
async function chamar(nome: string, argumentos?: Record<string, unknown>): Promise<any> {
  const { data, error } = await cliente().rpc(nome, argumentos);
  if (error) throw new Error(traduzirErro(error));
  return data;
}

const ddmmaaaa = (dia: string) => dia.split('-').reverse().join('/');

// Cada função do banco confere `privado.is_admin()`: quem não for administrador recebe "Área restrita ao administrador".
export const adminSupabase: RepositorioAdmin = {
  async metricasPesquisa(): Promise<MetricasPesquisa> {
    const m = await chamar('metricas_pesquisa');
    return {
      participantes: Number(m.participantes), preConcluidos: Number(m.preConcluidos), posConcluidos: Number(m.posConcluidos), nPares: Number(m.nPares),
      ganhoMedio: m.ganhoMedio === null ? null : Number(m.ganhoMedio),
      porPergunta: (m.porPergunta ?? []).map((p: any) => ({ numero: Number(p.numero), pre: Number(p.pre), pos: Number(p.pos) })),
      participantesTabela: (m.participantesTabela ?? []).map((p: any) => ({
        pseudonimo: p.pseudonimo, preData: iso(p.preData), preNota: p.preNota, posData: iso(p.posData), posNota: p.posNota,
      })),
    };
  },

  async exportarRespostas(): Promise<LinhaExportacao[]> {
    const linhas = (await chamar('exportar_respostas_testes')) ?? [];
    return linhas.map((l: any) => ({
      idPseudonimizado: l.id_pseudonimizado, tipoTeste: l.tipo_teste, forma: l.forma, versao: l.versao, data: ddmmaaaa(l.data),
      pergunta: Number(l.pergunta), respostaMarcada: l.resposta_marcada, acerto: l.acerto === 1 ? 1 : 0, notaTotal: Number(l.nota_total),
    }));
  },

  async listarQuestoes(): Promise<QuestaoAdmin[]> {
    const linhas = (await chamar('admin_listar_questoes')) ?? [];
    return linhas.map((l: any) => ({
      id: l.id, quizId: l.quiz_id, trilhaId: l.trilha_id, licaoId: l.licao_id, licaoOrdem: Number(l.licao_ordem), enunciado: l.enunciado,
      alternativas: l.alternativas, respostaCorreta: l.resposta_correta, nivelDificuldade: l.nivel_dificuldade, explicacao: l.explicacao,
      ativa: l.ativa, criadoEm: iso(l.criado_em)!, atualizadoEm: iso(l.atualizado_em)!,
    }));
  },

  async salvarQuestao(q) {
    return chamar('admin_salvar_questao', {
      p_id: q.id ?? null, p_quiz_id: q.quizId, p_enunciado: q.enunciado, p_alternativas: q.alternativas,
      p_resposta_correta: q.respostaCorreta, p_nivel: q.nivelDificuldade, p_explicacao: q.explicacao, p_ativa: q.ativa,
    });
  },

  async parametrosAtuais() {
    const { data, error } = await cliente().from('parametros_sistema').select('chave, valor, alterado_em').order('alterado_em');
    if (error) throw new Error(traduzirErro(error));
    const atuais = {} as Record<ChaveParametro, number>;
    for (const l of data ?? []) atuais[l.chave as ChaveParametro] = Number(l.valor);
    return atuais;
  },

  async historicoParametros(): Promise<LinhaHistoricoParametro[]> {
    const linhas = (await chamar('admin_historico_parametros')) ?? [];
    return linhas.map((l: any) => ({
      chave: l.chave, valor: Number(l.valor), valorAnterior: l.valor_anterior === null ? null : Number(l.valor_anterior), autor: l.autor, alteradoEm: iso(l.alterado_em)!,
    }));
  },

  async salvarParametros(v) {
    await chamar('admin_salvar_parametros', {
      p_inatividade: v.limite_inatividade_horas, p_janela: v.janela_motor, p_subida: v.limiar_subida, p_descida: v.limiar_descida,
    });
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */
