import { beforeEach, describe, expect, it, vi } from 'vitest';
import { atualizarAparelho } from '@/dados/aparelho';
import { carregarBanco, reiniciarBanco } from '@/dados/bancoLocal';
import { ID_ADMIN, ID_ALEX } from '@/dados/demo/usuarios';
import { rankingLocal } from './ranking';
import { treinoLocal } from './treino';

describe('modo treino no modo local', () => {
  beforeEach(() => {
    reiniciarBanco();
    atualizarAparelho({ sessaoUsuarioId: ID_ALEX, deslocamentoRelogioMs: 0 });
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  it('só libera questões de lições com quiz concluído (Alex fez 4 quizzes)', async () => {
    const { questoesDisponiveis, xpHoje } = await treinoLocal.estado();
    // 4 lições concluídas × 28 questões por lição (banco de 336)
    expect(questoesDisponiveis).toBe(4 * 28);
    expect(xpHoje).toBe(0);
  });

  it('quem não concluiu nenhum quiz não treina', async () => {
    atualizarAparelho({ sessaoUsuarioId: ID_ADMIN });
    expect((await treinoLocal.estado()).questoesDisponiveis).toBe(0);
    expect(await treinoLocal.proximaQuestao([])).toBeNull();
  });

  it('não repete questão na mesma sessão e nunca entrega a resposta correta', async () => {
    const vistas: string[] = [];
    for (let i = 0; i < 5; i++) {
      const q = await treinoLocal.proximaQuestao(vistas);
      expect(q).not.toBeNull();
      expect(Object.keys(q!).sort()).toEqual(['alternativas', 'enunciado', 'id', 'nivelDificuldade']);
      vistas.push(q!.id);
    }
    expect(new Set(vistas).size).toBe(5);
  });

  it('acerto dá XP reduzido; erro não dá; XP total sobe só pelo que foi concedido', async () => {
    const xpAntes = carregarBanco().usuarios.find((u) => u.id === ID_ALEX)!.xpTotal;
    const q = (await treinoLocal.proximaQuestao([]))!;
    const certa = carregarBanco().questoes.find((x) => x.id === q.id)!;
    const errou = await treinoLocal.responder(q.id, (certa.respostaCorreta + 1) % 4);
    expect(errou).toMatchObject({ acertou: false, xpGanho: 0, xpHoje: 0 });
    const acertou = await treinoLocal.responder(q.id, certa.respostaCorreta);
    expect(acertou.acertou).toBe(true);
    expect(acertou.xpGanho).toBeGreaterThan(0);
    expect(acertou.xpGanho).toBeLessThanOrEqual(7);
    expect(carregarBanco().usuarios.find((u) => u.id === ID_ALEX)!.xpTotal - xpAntes).toBe(acertou.xpGanho);
  });

  it('o teto diário de 40 XP vale, e o treino não mexe no quiz, na sequência nem nas conquistas', async () => {
    const antes = carregarBanco();
    const quizzes = antes.respostasQuiz.length;
    const badges = antes.usuarioBadges.length;
    const sequencia = antes.usuarios.find((u) => u.id === ID_ALEX)!.diasStreak;
    let total = 0;
    for (let i = 0; i < 40; i++) {
      const q = (await treinoLocal.proximaQuestao([]))!;
      const certa = carregarBanco().questoes.find((x) => x.id === q.id)!.respostaCorreta;
      total += (await treinoLocal.responder(q.id, certa)).xpGanho;
    }
    expect(total).toBe(40);
    const depois = carregarBanco();
    expect(depois.respostasQuiz).toHaveLength(quizzes);
    expect(depois.usuarioBadges).toHaveLength(badges);
    expect(depois.usuarios.find((u) => u.id === ID_ALEX)!.diasStreak).toBe(sequencia);
  });

  it('o XP do treino entra no ranking da semana e no geral', async () => {
    const semanaAntes = (await rankingLocal.ranking('semana')).find((l) => l.ehVoce)!.xp;
    const geralAntes = (await rankingLocal.ranking('geral')).find((l) => l.ehVoce)!.xp;
    const q = (await treinoLocal.proximaQuestao([]))!;
    const certa = carregarBanco().questoes.find((x) => x.id === q.id)!.respostaCorreta;
    const { xpGanho } = await treinoLocal.responder(q.id, certa);
    expect(xpGanho).toBeGreaterThan(0);
    expect((await rankingLocal.ranking('semana')).find((l) => l.ehVoce)!.xp - semanaAntes).toBe(xpGanho);
    expect((await rankingLocal.ranking('geral')).find((l) => l.ehVoce)!.xp - geralAntes).toBe(xpGanho);
  });

  it('questão de lição ainda não concluída é recusada', async () => {
    const naoLiberada = carregarBanco().questoes.find((q) => q.quizId === 'inflacao-e-investimentos-3-quiz')!;
    await expect(treinoLocal.responder(naoLiberada.id, 0)).rejects.toThrow('Questão indisponível para o treino');
  });
});
