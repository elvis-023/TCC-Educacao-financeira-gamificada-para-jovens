import { alterarBanco, carregarBanco, type BancoDados } from '@/dados/bancoLocal';
import { BADGES } from '@/dados/demo/badges';
import { LICOES, QUIZZES, TRILHAS } from '@/dados/demo/trilhas';
import type { CodigoBadge, Questao, ResultadoResposta } from '@/dados/tipos';
import { agora } from '@/lib/relogio';
import { verificarConquistas, xpPorResposta } from '@/regras/gamificacao';
import { trilhasConcluidas as contarTrilhasConcluidas } from '@/regras/progresso';
import { nivelAtualDaTrilha, porData, proximoNivel, selecionarProximaQuestao, type CandidataQuestao } from '@/regras/motorAdaptativo';
import type { RepositorioQuiz } from '../contratos';
import { estaOnline, parametrosAtuaisLocal, registrarAtividade, responder, usuarioDaSessao } from './comum';

const licaoDoQuiz = (quizId: string) => {
  const quiz = QUIZZES.find((q) => q.id === quizId);
  if (!quiz) throw new Error('Quiz não encontrado');
  return { quiz, licao: LICOES.find((l) => l.id === quiz.licaoId)! };
};
const candidataDe = (q: Questao): CandidataQuestao => ({ id: q.id, licaoOrdem: licaoDoQuiz(q.quizId).licao.ordem, nivel: q.nivelDificuldade, ativa: q.ativa });
const daTrilha = (questoes: Questao[], trilhaId: string) => questoes.filter((q) => licaoDoQuiz(q.quizId).licao.trilhaId === trilhaId);

/** RF08: confere as conquistas ao concluir o quiz, grava as novas e avisa. Mesma regra da função `conceder_conquistas` do servidor. */
function concederConquistas(banco: BancoDados, usuarioId: string, questoesNoQuiz: number, acertosNoQuiz: number, instante: Date): CodigoBadge[] {
  const meusProgressos = banco.progressos.filter((p) => p.usuarioId === usuarioId);
  const usuario = banco.usuarios.find((u) => u.id === usuarioId)!;
  const concluidasPorTrilha = TRILHAS.map((t) => meusProgressos.filter((p) => p.trilhaId === t.id && p.quizConcluidoEm).length);
  const novas = verificarConquistas({
    quizzesConcluidos: meusProgressos.filter((p) => p.quizConcluidoEm).length,
    trilhasConcluidas: contarTrilhasConcluidas(meusProgressos),
    maiorNumeroDeLicoesNumaTrilha: Math.max(...concluidasPorTrilha),
    sequenciaDias: usuario.diasStreak,
    acertosNoQuiz, questoesNoQuiz,
    chegouAoDificil: banco.respostasQuiz.some((r) => r.usuarioId === usuarioId && r.nivelTrilhaApos === 'dificil'),
    jaConquistadas: banco.usuarioBadges.filter((b) => b.usuarioId === usuarioId).map((b) => b.badgeId),
  });
  const quando = instante.toISOString();
  const aviso = (tipo: 'conquista' | 'sistema', mensagem: string, link: string) =>
    banco.notificacoes.push({ id: crypto.randomUUID(), usuarioId, tipo, mensagem, link, dataEnvio: quando, lida: false });
  for (const codigo of novas) {
    banco.usuarioBadges.push({ usuarioId, badgeId: codigo, conquistadoEm: quando });
    aviso('conquista', `Você ganhou a conquista ${BADGES.find((b) => b.id === codigo)!.nome}!`, '/conquistas');
  }
  if (novas.includes('mestre_das_financas')) aviso('sistema', 'Teste final liberado! Faça agora para ver a sua evolução.', '/pos-teste');
  return novas;
}

export const quizLocal: RepositorioQuiz = {
  async proximaQuestao(quizId) {
    const usuarioId = usuarioDaSessao();
    const banco = carregarBanco();
    const { quiz, licao } = licaoDoQuiz(quizId);
    if (!banco.progressos.find((p) => p.usuarioId === usuarioId && p.licaoId === licao.id)?.leituraConcluidaEm) throw new Error('Leia a lição antes do quiz');
    const minhas = banco.respostasQuiz.filter((r) => r.usuarioId === usuarioId);
    const noQuiz = minhas.filter((r) => r.quizId === quizId);
    if (noQuiz.length >= quiz.numeroQuestoes) return responder(null);
    const naTrilha = minhas.filter((r) => r.trilhaId === licao.trilhaId);
    const id = selecionarProximaQuestao({
      nivelAtual: nivelAtualDaTrilha(naTrilha), licaoAtualOrdem: licao.ordem,
      questoesDaTrilha: daTrilha(banco.questoes, licao.trilhaId).map(candidataDe),
      respondidasPeloJovem: naTrilha.map((r) => ({ questaoId: r.questaoId, respondidaEm: r.respondidaEm })),
      respondidasNesteQuiz: noQuiz.map((r) => r.questaoId), aleatorio: Math.random,
    });
    if (!id) throw new Error('Não há questões ativas para este quiz');
    const q = banco.questoes.find((x) => x.id === id)!;
    return responder({
      id: q.id, enunciado: q.enunciado, alternativas: q.alternativas, nivelDificuldade: q.nivelDificuldade,
      licaoOrdem: licaoDoQuiz(q.quizId).licao.ordem, numeroNoQuiz: noQuiz.length + 1, totalNoQuiz: quiz.numeroQuestoes,
    });
  },

  async responder(quizId, questaoId, alternativa) {
    const usuarioId = usuarioDaSessao();
    const resultado = alterarBanco((banco): ResultadoResposta => {
      const { quiz, licao } = licaoDoQuiz(quizId);
      const progresso = banco.progressos.find((p) => p.usuarioId === usuarioId && p.licaoId === licao.id);
      if (!progresso?.leituraConcluidaEm) throw new Error('Leia a lição antes do quiz');
      const minhas = banco.respostasQuiz.filter((r) => r.usuarioId === usuarioId);
      const noQuiz = minhas.filter((r) => r.quizId === quizId);
      if (noQuiz.length >= quiz.numeroQuestoes) throw new Error('Este quiz já foi concluído');
      const questao = banco.questoes.find((q) => q.id === questaoId);
      if (!questao || !questao.ativa) throw new Error('Questão indisponível');
      const daQuestao = licaoDoQuiz(questao.quizId).licao;
      if (daQuestao.trilhaId !== licao.trilhaId || daQuestao.ordem > licao.ordem || noQuiz.some((r) => r.questaoId === questaoId)) {
        throw new Error('Questão fora deste quiz');
      }

      const naTrilha = minhas.filter((r) => r.trilhaId === licao.trilhaId).sort(porData);
      const parametros = parametrosAtuaisLocal(banco);
      const nivelAntes = nivelAtualDaTrilha(naTrilha);
      const acertou = alternativa === questao.respostaCorreta;
      const xpGanho = xpPorResposta(questao.nivelDificuldade, acertou);
      const nivelDepois = proximoNivel(nivelAntes, [...naTrilha.map((r) => r.acertou), acertou], {
        janela: parametros.janela_motor, limiarSubida: parametros.limiar_subida, limiarDescida: parametros.limiar_descida,
      });
      const instante = agora();
      banco.respostasQuiz.push({
        id: crypto.randomUUID(), usuarioId, quizId, questaoId, trilhaId: licao.trilhaId, nivelQuestao: questao.nivelDificuldade,
        alternativaMarcada: alternativa, acertou, xpGanho, nivelTrilhaApos: nivelDepois, respondidaEm: instante.toISOString(),
      });
      banco.usuarios.find((u) => u.id === usuarioId)!.xpTotal += xpGanho;

      const doQuiz = banco.respostasQuiz.filter((r) => r.usuarioId === usuarioId && r.quizId === quizId);
      const acertosNoQuiz = doQuiz.filter((r) => r.acertou).length;
      const xpNoQuiz = doQuiz.reduce((s, r) => s + r.xpGanho, 0);
      const quizConcluido = doQuiz.length >= quiz.numeroQuestoes;
      let trilhaConcluida = false;
      let conquistasNovas: CodigoBadge[] = [];
      if (quizConcluido) {
        Object.assign(progresso, { quizConcluidoEm: instante.toISOString(), acertos: acertosNoQuiz, xpGanho: xpNoQuiz, sincronizadoOffline: estaOnline() });
        registrarAtividade(banco, usuarioId, instante);
        trilhaConcluida = banco.progressos.filter((p) => p.usuarioId === usuarioId && p.trilhaId === licao.trilhaId && p.quizConcluidoEm).length >= 3;
        conquistasNovas = concederConquistas(banco, usuarioId, quiz.numeroQuestoes, acertosNoQuiz, instante);
      }
      return {
        acertou, respostaCorreta: questao.respostaCorreta, explicacao: questao.explicacao, xpGanho, nivelAntes, nivelDepois,
        quizConcluido, acertosNoQuiz, xpNoQuiz, trilhaConcluida, conquistasNovas,
      };
    });
    return responder(resultado);
  },
};
