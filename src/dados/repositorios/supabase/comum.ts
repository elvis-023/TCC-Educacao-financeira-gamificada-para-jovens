import { cliente } from '@/lib/supabase/client';

export { cliente };

/** Traduz os erros do Supabase Auth; as funções do banco já respondem em português. */
export function traduzirErro(erro: { message: string; status?: number } | null): string {
  if (!erro) return 'Algo deu errado. Tente de novo.';
  const m = erro.message;
  if (/invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos';
  if (/email not confirmed/i.test(m)) return 'Confirme o seu e-mail antes de entrar: procure o link na sua caixa de entrada.';
  if (/already registered|already been registered/i.test(m)) return 'Já existe uma conta com este e-mail';
  if (/email address .* is invalid|email_address_invalid/i.test(m)) return 'Digite um e-mail válido';
  if (/database error saving new user|aceites obrigatórios/i.test(m)) return 'Não foi possível criar a conta. Confira os aceites e tente de novo.';
  if (/password should be at least/i.test(m)) return 'A senha precisa ter pelo menos 8 caracteres';
  if (/rate limit|too many requests|over_email_send_rate_limit/i.test(m)) return 'Muitas tentativas seguidas. Aguarde um pouco e tente de novo.';
  if (/failed to fetch|network/i.test(m)) return 'Sem conexão com o servidor. Confira a internet e tente de novo.';
  if (/permission denied/i.test(m)) return 'Você não tem permissão para esta ação.';
  return m;
}

export async function usuarioLogadoId(): Promise<string> {
  const { data } = await cliente().auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('Sua sessão expirou. Entre de novo.');
  return id;
}

/** Para funções cuja parte Supabase ainda não foi feita. */
export const naoDisponivel = async (): Promise<never> => {
  throw new Error('Ainda não disponível com a base de dados');
};

/** Instantes do PostgREST ("...+00:00", microssegundos) no mesmo formato ISO do modo local. */
export const iso = (valor: string | null) => (valor ? new Date(valor).toISOString() : null);
