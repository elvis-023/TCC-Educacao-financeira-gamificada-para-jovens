import { describe, expect, it } from 'vitest';
import { xpPorResposta } from './gamificacao';

describe('XP (RN03)', () => {
  it('RN03: acerto Fácil 10, Médio 20, Difícil 35; erro 2', () => {
    expect([xpPorResposta('facil', true), xpPorResposta('medio', true), xpPorResposta('dificil', true)]).toEqual([10, 20, 35]);
    expect([xpPorResposta('facil', false), xpPorResposta('dificil', false)]).toEqual([2, 2]);
  });
});
