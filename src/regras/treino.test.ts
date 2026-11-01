import { describe, expect, it } from 'vitest';
import { escolherQuestaoTreino, QUESTOES_POR_TREINO, TETO_XP_TREINO_DIARIO, xpConcedidoNoTreino, xpDoTreino } from './treino';

describe('modo treino', () => {
  it('XP do treino é 20% do XP do quiz (Fácil 2, Médio 4, Difícil 7) e o erro não vale XP', () => {
    expect([xpDoTreino('facil', true), xpDoTreino('medio', true), xpDoTreino('dificil', true)]).toEqual([2, 4, 7]);
    expect([xpDoTreino('facil', false), xpDoTreino('dificil', false)]).toEqual([0, 0]);
  });

  it('o teto diário de XP do treino é respeitado, sem passar do que falta', () => {
    expect(TETO_XP_TREINO_DIARIO).toBe(40);
    expect(xpConcedidoNoTreino(7, 0)).toBe(7);
    expect(xpConcedidoNoTreino(7, 36)).toBe(4);
    expect(xpConcedidoNoTreino(7, 40)).toBe(0);
    expect(xpConcedidoNoTreino(7, 55)).toBe(0);
  });

  it('um treino tem 5 questões', () => {
    expect(QUESTOES_POR_TREINO).toBe(5);
  });

  it('escolhe a questão menos treinada e não repete as já vistas na sessão', () => {
    const candidatas = [
      { id: 'a', vezes: 3 }, { id: 'b', vezes: 0 }, { id: 'c', vezes: 0 }, { id: 'd', vezes: 1 },
    ];
    expect(['b', 'c']).toContain(escolherQuestaoTreino(candidatas, [], () => 0.5));
    expect(escolherQuestaoTreino(candidatas, ['b'], () => 0)).toBe('c');
    expect(escolherQuestaoTreino(candidatas, ['b', 'c'], () => 0)).toBe('d');
    expect(escolherQuestaoTreino(candidatas, ['b', 'c', 'd', 'a'], () => 0)).toBeNull();
    expect(escolherQuestaoTreino([], [], () => 0)).toBeNull();
  });
});
