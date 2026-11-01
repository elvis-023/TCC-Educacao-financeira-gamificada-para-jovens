import { lerAparelho } from '@/dados/aparelho';
import type { BancoDados } from '@/dados/bancoLocal';
import type { ChaveParametro } from '@/dados/tipos';
import { diaNoFuso } from '@/lib/fuso';
import { atualizarSequencia } from '@/regras/sequencia';

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

export const estaOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine);

/** Lição ou quiz concluído: atualiza a sequência (dia no fuso de São Paulo, RN04) e a última atividade. */
export function registrarAtividade(banco: BancoDados, usuarioId: string, instante: Date): void {
  const usuario = banco.usuarios.find((u) => u.id === usuarioId)!;
  const sequencia = atualizarSequencia(usuario.diasStreak, usuario.ultimoDiaUso, diaNoFuso(instante));
  usuario.diasStreak = sequencia.diasStreak;
  usuario.ultimoDiaUso = sequencia.ultimoDiaUso;
  usuario.ultimaAtividadeEm = instante.toISOString();
}

/** Valor mais recente de cada parâmetro (o histórico só acrescenta linhas). */
export function parametrosAtuaisLocal(banco: BancoDados): Record<ChaveParametro, number> {
  const atuais = {} as Record<ChaveParametro, number>;
  const ordenados = [...banco.parametros].sort((a, b) => a.alteradoEm.localeCompare(b.alteradoEm));
  for (const p of ordenados) atuais[p.chave] = p.valor;
  return atuais;
}

/** Pseudônimo local: "P-" + 4 caracteres hexadecimais, sem repetir (PRD 2.1). */
export function gerarPseudonimoLocal(existentes: string[]): string {
  for (;;) {
    const candidato = `P-${Math.floor(Math.random() * 0x10000).toString(16).toUpperCase().padStart(4, '0')}`;
    if (!existentes.includes(candidato)) return candidato;
  }
}
