import { beforeEach, describe, expect, it, vi } from 'vitest';
import { atualizarAparelho } from '@/dados/aparelho';
import { carregarBanco, reiniciarBanco } from '@/dados/bancoLocal';
import { ID_ALEX } from '@/dados/demo/usuarios';
import { progressoLocal } from './progresso';
import { quizLocal } from './quiz';

const QUIZ = 'juros-compostos-2-quiz';

/** Responde a questão que o quiz entregar, acertando ou errando de propósito. */
async function responderProxima(acertar: boolean) {
  const questao = await quizLocal.proximaQuestao(QUIZ);
  if (!questao) throw new Error('sem questão');
  const certa = carregarBanco().questoes.find((q) => q.id === questao.id)!.respostaCorreta;
  const resultado = await quizLocal.responder(QUIZ, questao.id, acertar ? certa : (certa + 1) % 4);
  return { questao, resultado };
}

describe('quiz no modo local (RN02, RN03, RF02)', () => {
  beforeEach(() => {
    reiniciarBanco();
    atualizarAparelho({ sessaoUsuarioId: ID_ALEX, deslocamentoRelogioMs: 0 });
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  it('o quiz só abre com a leitura da lição concluída', async () => {
    await expect(quizLocal.proximaQuestao(QUIZ)).rejects.toThrow('Leia a lição antes do quiz');
  });

  it('RN02 e RN03: 3 acertos na lição 2 de Juros Compostos — sobe para Difícil depois da 2ª e dá +75 XP', async () => {
    await progressoLocal.concluirLeitura('juros-compostos-2');
    const xpAntes = carregarBanco().usuarios.find((u) => u.id === ID_ALEX)!.xpTotal;

    const primeira = await responderProxima(true);
    expect(primeira.questao).toMatchObject({ nivelDificuldade: 'medio', numeroNoQuiz: 1, totalNoQuiz: 3 });
    expect(primeira.resultado).toMatchObject({ acertou: true, xpGanho: 20, nivelAntes: 'medio', nivelDepois: 'medio', quizConcluido: false });

    const segunda = await responderProxima(true);
    expect(segunda.resultado).toMatchObject({ nivelAntes: 'medio', nivelDepois: 'dificil', quizConcluido: false });

    const terceira = await responderProxima(true);
    expect(terceira.questao.nivelDificuldade).toBe('dificil');
    expect(terceira.resultado).toMatchObject({ xpGanho: 35, quizConcluido: true, acertosNoQuiz: 3, xpNoQuiz: 75, trilhaConcluida: false });

    const alex = carregarBanco().usuarios.find((u) => u.id === ID_ALEX)!;
    expect(alex.xpTotal - xpAntes).toBe(75);
    expect(alex.diasStreak).toBe(5); // RN04: sequência de 4 dias até ontem, mais hoje
    expect(await quizLocal.proximaQuestao(QUIZ)).toBeNull();
  });

  it('RF08: o roteiro concede Gabaritou e Desafio Aceito, avisa no sino e não repete', async () => {
    await progressoLocal.concluirLeitura('juros-compostos-2');
    await responderProxima(true);
    await responderProxima(true);
    const { resultado } = await responderProxima(true);
    expect(resultado.conquistasNovas).toEqual(['gabaritou', 'desafio_aceito']);

    const banco = carregarBanco();
    const doAlex = banco.usuarioBadges.filter((b) => b.usuarioId === ID_ALEX).map((b) => b.badgeId);
    expect(doAlex.sort()).toEqual(['desafio_aceito', 'gabaritou', 'primeira_trilha', 'primeiro_quiz']);
    const avisos = banco.notificacoes.filter((n) => n.usuarioId === ID_ALEX && n.tipo === 'conquista' && !n.lida);
    expect(avisos.map((n) => n.mensagem)).toEqual(expect.arrayContaining(['Você ganhou a conquista Gabaritou!', 'Você ganhou a conquista Desafio Aceito!']));
  });

  it('nenhuma questão se repete dentro do mesmo quiz e o erro vale 2 XP de participação', async () => {
    await progressoLocal.concluirLeitura('juros-compostos-2');
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const { questao, resultado } = await responderProxima(false);
      ids.push(questao.id);
      expect(resultado).toMatchObject({ acertou: false, xpGanho: 2 });
    }
    expect(new Set(ids).size).toBe(3);
  });

  it('questão inativa nunca aparece (RF10)', async () => {
    await progressoLocal.concluirLeitura('juros-compostos-2');
    carregarBanco().questoes.find((q) => q.id === 'juros-compostos-2-m1')!.ativa = false;
    const { questao } = await responderProxima(true);
    expect(questao.id).not.toBe('juros-compostos-2-m1');
  });

  it('a pergunta pública não revela a resposta correta nem a explicação', async () => {
    await progressoLocal.concluirLeitura('juros-compostos-2');
    const questao = await quizLocal.proximaQuestao(QUIZ);
    expect(Object.keys(questao!).sort()).toEqual(
      ['alternativas', 'enunciado', 'id', 'licaoOrdem', 'nivelDificuldade', 'numeroNoQuiz', 'totalNoQuiz'],
    );
  });
});
