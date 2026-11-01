import { diasEntre } from '@/lib/fuso';

/** RN04: registra um dia de uso (AAAA-MM-DD no fuso de São Paulo). */
export function atualizarSequencia(diasStreak: number, ultimoDiaUso: string | null, hoje: string): { diasStreak: number; ultimoDiaUso: string } {
  if (ultimoDiaUso === hoje) return { diasStreak, ultimoDiaUso };
  if (ultimoDiaUso && diasEntre(ultimoDiaUso, hoje) === 1) return { diasStreak: diasStreak + 1, ultimoDiaUso: hoje };
  return { diasStreak: 1, ultimoDiaUso: hoje };
}

/** RN04: a sequência guardada vale se o último dia de uso foi hoje ou ontem; senão, um dia terminou sem uso. */
export function sequenciaAtual(diasStreak: number, ultimoDiaUso: string | null, hoje: string): number {
  if (!ultimoDiaUso) return 0;
  return diasEntre(ultimoDiaUso, hoje) <= 1 ? diasStreak : 0;
}

export function horasDeInatividade(ultimaAtividadeEm: string | null, agora: Date): number | null {
  return ultimaAtividadeEm ? (agora.getTime() - Date.parse(ultimaAtividadeEm)) / 3_600_000 : null;
}

/** RF09: inatividade acima do limite, com trilha iniciada e não concluída, uma vez por período. */
export function deveGerarLembrete(e: {
  receberLembretes: boolean;
  temTrilhaEmAndamento: boolean;
  ultimaAtividadeEm: string | null;
  ultimoLembreteEm: string | null;
  limiteHoras: number;
  agora: Date;
}): boolean {
  if (!e.receberLembretes || !e.temTrilhaEmAndamento || !e.ultimaAtividadeEm) return false;
  if ((horasDeInatividade(e.ultimaAtividadeEm, e.agora) ?? 0) <= e.limiteHoras) return false;
  return !(e.ultimoLembreteEm && e.ultimoLembreteEm >= e.ultimaAtividadeEm);
}
