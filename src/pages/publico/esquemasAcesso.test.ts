import { describe, expect, it } from 'vitest';
import { esquemaCadastro, esquemaEntrar, oQueFalta } from './esquemasAcesso';

const valido = { nome: 'Ana Souza', email: 'ana@exemplo.test', senha: '12345678', confirmarSenha: '12345678', aceiteTcle: true, aceitePrivacidade: true, maioridade: true };

describe('cadastro e login (RF01, RNF06)', () => {
  it('aceita o cadastro completo', () => {
    expect(esquemaCadastro.safeParse(valido).success).toBe(true);
  });
  it('recusa e-mail inválido, senha curta, confirmação diferente e aceites desmarcados', () => {
    expect(esquemaCadastro.safeParse({ ...valido, email: 'ana@' }).success).toBe(false);
    expect(esquemaCadastro.safeParse({ ...valido, senha: '1234567', confirmarSenha: '1234567' }).success).toBe(false);
    expect(esquemaCadastro.safeParse({ ...valido, confirmarSenha: '87654321' }).success).toBe(false);
    expect(esquemaCadastro.safeParse({ ...valido, aceiteTcle: false }).success).toBe(false);
    expect(esquemaCadastro.safeParse({ ...valido, maioridade: false }).success).toBe(false);
  });
  it('diz o que falta, na ordem dos campos', () => {
    expect(oQueFalta({ ...valido, aceiteTcle: false })).toBe('Falta aceitar o TCLE');
    expect(oQueFalta({ ...valido, nome: '' })).toBe('Falta preencher o nome');
    expect(oQueFalta(valido)).toBeNull();
  });
  it('login exige e-mail válido e senha com 8 caracteres', () => {
    expect(esquemaEntrar.safeParse({ email: 'ana@exemplo.test', senha: '12345678' }).success).toBe(true);
    expect(esquemaEntrar.safeParse({ email: 'ana', senha: '12345678' }).success).toBe(false);
  });
});
