import { lerAparelho } from '@/dados/aparelho';

export const LATENCIA_MS = import.meta.env.MODE === 'test' ? 0 : 300;

/** Devolve uma cópia, depois da latência simulada, para a tela nunca alterar o banco por engano. */
export async function responder<T>(valor: T): Promise<T> {
  if (LATENCIA_MS > 0) await new Promise((resolver) => setTimeout(resolver, LATENCIA_MS));
  return structuredClone(valor);
}

/** Usuário da sessão local. Sem sessão, o repositório recusa a operação. */
export function usuarioDaSessao(): string {
  const id = lerAparelho().sessaoUsuarioId;
  if (!id) throw new Error('Sua sessão expirou. Entre de novo.');
  return id;
}

/** Pseudônimo local: "P-" + 4 caracteres hexadecimais, sem repetir (PRD 2.1). */
export function gerarPseudonimoLocal(existentes: string[]): string {
  for (;;) {
    const candidato = `P-${Math.floor(Math.random() * 0x10000).toString(16).toUpperCase().padStart(4, '0')}`;
    if (!existentes.includes(candidato)) return candidato;
  }
}
