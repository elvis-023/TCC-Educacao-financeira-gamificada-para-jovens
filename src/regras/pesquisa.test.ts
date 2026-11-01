import { describe, expect, it } from 'vitest';
import { diferencaPp, formaDoTeste, percentualDeAcerto } from './pesquisa';

describe('teste diagnóstico (RF05)', () => {
  it('RF05: pré-teste usa a Forma A e pós-teste a Forma B', () => {
    expect(formaDoTeste('pre')).toBe('A');
    expect(formaDoTeste('pos')).toBe('B');
  });
  it('RF05: percentual de acerto e diferença em pontos percentuais', () => {
    expect(percentualDeAcerto(1, 3)).toBeCloseTo(33.333, 3);
    expect(diferencaPp(1, 3, 3)).toBeCloseTo(66.667, 3);
    expect(diferencaPp(3, 2, 3)).toBeCloseTo(-33.333, 3);
  });
});
