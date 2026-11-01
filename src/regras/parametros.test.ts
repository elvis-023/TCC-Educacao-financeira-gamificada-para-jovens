import { describe, expect, it } from 'vitest';
import { validarParametros } from './parametros';

const padrao = { limite_inatividade_horas: 48, janela_motor: 5, limiar_subida: 80, limiar_descida: 40 };

describe('parâmetros (RF11)', () => {
  it('RF11: aceita os valores padrão', () => {
    expect(validarParametros(padrao)).toEqual({});
  });
  it('RF11: descida precisa ser menor que subida; faixas e inteiros', () => {
    expect(validarParametros({ ...padrao, limiar_descida: 80 })).toEqual({ limiar_descida: 'O limiar de descida precisa ser menor que o de subida' });
    expect(validarParametros({ ...padrao, janela_motor: 2 })).toEqual({ janela_motor: 'Use um número inteiro de 3 a 20' });
    expect(validarParametros({ ...padrao, limite_inatividade_horas: 1.5 })).toEqual({ limite_inatividade_horas: 'Use um número inteiro de 1 a 720' });
  });
});
