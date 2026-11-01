import { alterarBanco, carregarBanco, type BancoDados } from '@/dados/bancoLocal';
import { PERGUNTAS_DIAGNOSTICAS } from '@/dados/demo/perguntasDiagnosticas';
import { LICOES, QUIZZES, TRILHAS } from '@/dados/demo/trilhas';
import type { ChaveParametro, LinhaHistoricoParametro, Nivel, QuestaoAdmin } from '@/dados/tipos';
import { agora } from '@/lib/relogio';
import { validarParametros } from '@/regras/parametros';
import { validarQuestao } from '@/regras/bancoQuestoes';
import { calcularMetricas, linhasDeExportacao } from '@/regras/pesquisa';
import type { RepositorioAdmin } from '../contratos';
import { parametrosAtuaisLocal, responder, usuarioDaSessao } from './comum';

const ORDEM_NIVEL: Record<Nivel, number> = { facil: 0, medio: 1, dificil: 2 };

/** O usuário da sessão precisa ser administrador (no servidor, quem recusa é `privado.is_admin()`). */
function exigirAdmin(banco: BancoDados = carregarBanco()) {
  const usuario = banco.usuarios.find((u) => u.id === usuarioDaSessao());
  if (usuario?.papel !== 'admin') throw new Error('Área restrita ao administrador');
  return usuario;
}

function comoAdmin(banco: BancoDados): QuestaoAdmin[] {
  return banco.questoes
    .map((q) => {
      const licao = LICOES.find((l) => l.id === QUIZZES.find((z) => z.id === q.quizId)!.licaoId)!;
      return { ...q, trilhaId: licao.trilhaId, licaoId: licao.id, licaoOrdem: licao.ordem };
    })
    .sort((a, b) =>
      TRILHAS.findIndex((t) => t.id === a.trilhaId) - TRILHAS.findIndex((t) => t.id === b.trilhaId)
      || a.licaoOrdem - b.licaoOrdem || ORDEM_NIVEL[a.nivelDificuldade] - ORDEM_NIVEL[b.nivelDificuldade] || a.id.localeCompare(b.id));
}

export const adminLocal: RepositorioAdmin = {
  async metricasPesquisa() {
    const banco = carregarBanco();
    exigirAdmin(banco);
    return responder(calcularMetricas({
      participantes: banco.usuarios.filter((u) => u.papel === 'jovem').length,
      testes: banco.testes, respostas: banco.respostasTeste, perguntas: PERGUNTAS_DIAGNOSTICAS,
    }));
  },

  async exportarRespostas() {
    const banco = carregarBanco();
    exigirAdmin(banco);
    return responder(linhasDeExportacao(banco.testes, banco.respostasTeste, PERGUNTAS_DIAGNOSTICAS));
  },

  async listarQuestoes() {
    const banco = carregarBanco();
    exigirAdmin(banco);
    return responder(comoAdmin(banco));
  },

  async salvarQuestao(questao) {
    const id = alterarBanco((banco) => {
      exigirAdmin(banco);
      const erro = validarQuestao(questao, banco.questoes, PERGUNTAS_DIAGNOSTICAS);
      if (erro) throw new Error(erro);
      const instante = agora().toISOString();
      if (!questao.id) {
        const nova = {
          id: `q-${crypto.randomUUID()}`, quizId: questao.quizId, enunciado: questao.enunciado.trim(), alternativas: questao.alternativas,
          respostaCorreta: questao.respostaCorreta, nivelDificuldade: questao.nivelDificuldade, explicacao: questao.explicacao.trim(),
          ativa: questao.ativa, criadoEm: instante, atualizadoEm: instante,
        };
        banco.questoes.push(nova);
        return nova.id;
      }
      const existente = banco.questoes.find((q) => q.id === questao.id);
      if (!existente) throw new Error('Questão não encontrada');
      Object.assign(existente, {
        quizId: questao.quizId, enunciado: questao.enunciado.trim(), alternativas: questao.alternativas, respostaCorreta: questao.respostaCorreta,
        nivelDificuldade: questao.nivelDificuldade, explicacao: questao.explicacao.trim(), ativa: questao.ativa, atualizadoEm: instante,
      });
      return existente.id;
    });
    return responder(id);
  },

  async parametrosAtuais() {
    const banco = carregarBanco();
    exigirAdmin(banco);
    return responder(parametrosAtuaisLocal(banco));
  },

  async historicoParametros() {
    const banco = carregarBanco();
    exigirAdmin(banco);
    const anterior = new Map<ChaveParametro, number>();
    const linhas: LinhaHistoricoParametro[] = [...banco.parametros]
      .sort((a, b) => a.alteradoEm.localeCompare(b.alteradoEm))
      .map((p) => {
        const linha = {
          chave: p.chave, valorAnterior: anterior.get(p.chave) ?? null, valor: p.valor, alteradoEm: p.alteradoEm,
          autor: banco.usuarios.find((u) => u.id === p.alteradoPor)?.nome ?? 'Sistema (valor padrão)',
        };
        anterior.set(p.chave, p.valor);
        return linha;
      });
    return responder(linhas.reverse());
  },

  async salvarParametros(valores) {
    const erros = validarParametros(valores);
    const mensagem = Object.values(erros)[0];
    if (mensagem) throw new Error(mensagem);
    alterarBanco((banco) => {
      const admin = exigirAdmin(banco);
      const atuais = parametrosAtuaisLocal(banco);
      const instante = agora().toISOString();
      for (const chave of Object.keys(valores) as ChaveParametro[]) {
        if (valores[chave] === atuais[chave]) continue;
        banco.parametros.push({ id: crypto.randomUUID(), chave, valor: valores[chave], alteradoPor: admin.id, alteradoEm: instante });
      }
    });
    await responder(null);
  },
};
