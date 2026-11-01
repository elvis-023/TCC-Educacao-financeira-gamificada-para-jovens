import { lerAparelho } from '@/dados/aparelho';
import { ID_ALEX } from '@/dados/demo/usuarios';

export const LATENCIA_MS = import.meta.env.MODE === 'test' ? 0 : 300;

/** Devolve uma cópia, depois da latência simulada, para a tela nunca alterar o banco por engano. */
export async function responder<T>(valor: T): Promise<T> {
  if (LATENCIA_MS > 0) await new Promise((resolver) => setTimeout(resolver, LATENCIA_MS));
  return structuredClone(valor);
}

/** Usuário da sessão local. Até o passo 6, o app age como o jovem de demonstração. */
export function usuarioDaSessao(): string {
  return lerAparelho().sessaoUsuarioId ?? ID_ALEX;
}
