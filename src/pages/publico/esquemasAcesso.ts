import { z } from 'zod';

const email = z.string().trim().min(1, 'Informe o seu e-mail').pipe(z.email('Digite um e-mail válido'));

export const esquemaCadastro = z.object({
  nome: z.string().trim().min(2, 'Informe o seu nome').max(80, 'Use no máximo 80 caracteres'),
  email,
  senha: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres'),
  confirmarSenha: z.string(),
  aceiteTcle: z.literal(true, { error: 'Aceite o TCLE para continuar' }),
  aceitePrivacidade: z.literal(true, { error: 'Aceite a Política de Privacidade para continuar' }),
  maioridade: z.literal(true, { error: 'Confirme que você tem 18 anos ou mais' }),
}).refine((v) => v.senha === v.confirmarSenha, { path: ['confirmarSenha'], message: 'As senhas não são iguais' });
export type FormularioCadastro = z.input<typeof esquemaCadastro>;

export const esquemaEntrar = z.object({ email, senha: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres') });
export const esquemaEsqueciSenha = z.object({ email });

/** Texto curto abaixo do botão Criar conta (PRD T02). */
export function oQueFalta(v: Partial<Record<keyof FormularioCadastro, unknown>>): string | null {
  const passos: [boolean, string][] = [
    [String(v.nome ?? '').trim().length >= 2, 'preencher o nome'],
    [z.email().safeParse(String(v.email ?? '').trim()).success, 'informar um e-mail válido'],
    [String(v.senha ?? '').length >= 8, 'criar uma senha com pelo menos 8 caracteres'],
    [v.senha === v.confirmarSenha && String(v.confirmarSenha ?? '') !== '', 'confirmar a senha'],
    [v.aceiteTcle === true, 'aceitar o TCLE'],
    [v.aceitePrivacidade === true, 'aceitar a Política de Privacidade'],
    [v.maioridade === true, 'declarar que tem 18 anos ou mais'],
  ];
  const pendente = passos.find(([ok]) => !ok);
  return pendente ? `Falta ${pendente[1]}` : null;
}
