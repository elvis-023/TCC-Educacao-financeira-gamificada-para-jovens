import { alterarBanco, carregarBanco, type BancoDados } from '@/dados/bancoLocal';
import { QUIZZES } from '@/dados/demo/trilhas';
import type { Questao } from '@/dados/tipos';
import { diaNoFuso } from '@/lib/fuso';
import { agora } from '@/lib/relogio';
import { escolherQuestaoTreino, xpConcedidoNoTreino, xpDoTreino } from '@/regras/treino';
import type { RepositorioTreino } from '../contratos';
import { responder, usuarioDaSessao } from './comum';

/** Só entram questões de lições cujo quiz a pessoa já concluiu: o treino é revisão, nunca adianta o quiz. */
function questoesLiberadas(banco: BancoDados, usuarioId: string): Questao[] {
  const licoes = new Set(banco.progressos.filter((p) => p.usuarioId === usuarioId && p.quizConcluidoEm).map((p) => p.licaoId));
  const quizzes = new Set(QUIZZES.filter((q) => licoes.has(q.licaoId)).map((q) => q.id));
  return banco.questoes.filter((q) => q.ativa && quizzes.has(q.quizId));
}

const xpDeHoje = (banco: BancoDados, usuarioId: string) => {
  const hoje = diaNoFuso(agora());
  return banco.respostasTreino.filter((r) => r.usuarioId === usuarioId && diaNoFuso(r.respondidaEm) === hoje).reduce((soma, r) => soma + r.xpGanho, 0);
};

export const treinoLocal: RepositorioTreino = {
  async estado() {
    const banco = carregarBanco();
    const usuarioId = usuarioDaSessao();
    return responder({ questoesDisponiveis: questoesLiberadas(banco, usuarioId).length, xpHoje: xpDeHoje(banco, usuarioId) });
  },

  async proximaQuestao(jaVistas) {
    const banco = carregarBanco();
    const usuarioId = usuarioDaSessao();
    const liberadas = questoesLiberadas(banco, usuarioId);
    const id = escolherQuestaoTreino(
      liberadas.map((q) => ({ id: q.id, vezes: banco.respostasTreino.filter((r) => r.usuarioId === usuarioId && r.questaoId === q.id).length })),
      jaVistas, Math.random,
    );
    const q = liberadas.find((x) => x.id === id);
    return responder(q ? { id: q.id, enunciado: q.enunciado, alternativas: q.alternativas, nivelDificuldade: q.nivelDificuldade } : null);
  },

  async responder(questaoId, alternativa) {
    const usuarioId = usuarioDaSessao();
    const resultado = alterarBanco((banco) => {
      const questao = questoesLiberadas(banco, usuarioId).find((q) => q.id === questaoId);
      if (!questao) throw new Error('Questão indisponível para o treino');
      const acertou = alternativa === questao.respostaCorreta;
      const antes = xpDeHoje(banco, usuarioId);
      const xpGanho = xpConcedidoNoTreino(xpDoTreino(questao.nivelDificuldade, acertou), antes);
      banco.respostasTreino.push({ id: crypto.randomUUID(), usuarioId, questaoId, acertou, xpGanho, respondidaEm: agora().toISOString() });
      banco.usuarios.find((u) => u.id === usuarioId)!.xpTotal += xpGanho;
      return { acertou, respostaCorreta: questao.respostaCorreta, explicacao: questao.explicacao, xpGanho, xpHoje: antes + xpGanho };
    });
    return responder(resultado);
  },
};
