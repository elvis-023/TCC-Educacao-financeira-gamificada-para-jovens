import { expect, it } from 'vitest';
import { normalizarTexto } from './texto';

it('normaliza acentos, maiúsculas e pontuação', () => {
  expect(normalizarTexto('  Verdadeiro OU falso: ações?  ')).toBe('verdadeiro ou falso acoes');
});
