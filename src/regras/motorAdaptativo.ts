import type { Nivel, RespostaQuiz } from '@/dados/tipos';

export const porData = (a: { respondidaEm: string }, b: { respondidaEm: string }) => a.respondidaEm.localeCompare(b.respondidaEm);

/** RN02: o nível atual é o da última resposta na trilha; toda trilha começa no Médio. */
export function nivelAtualDaTrilha(respostasDaTrilha: RespostaQuiz[]): Nivel {
  const ordenadas = [...respostasDaTrilha].sort(porData);
  return ordenadas.at(-1)?.nivelTrilhaApos ?? 'medio';
}
