import { TZDate } from '@date-fns/tz';
import { format, startOfWeek } from 'date-fns';

export const FUSO = 'America/Sao_Paulo';

export function noFuso(instante: Date | string | number): TZDate {
  return new TZDate(new Date(instante).getTime(), FUSO);
}

/** Dia-calendário em São Paulo, no formato AAAA-MM-DD. */
export function diaNoFuso(instante: Date | string | number): string {
  return format(noFuso(instante), 'yyyy-MM-dd');
}

/** Instante ISO (UTC) de um horário de São Paulo, `diasAtras` dias antes de `agora`. */
export function instanteRelativo(agora: Date, diasAtras: number, hora: number, minuto = 0): string {
  const hoje = noFuso(agora);
  const alvo = new TZDate(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - diasAtras, hora, minuto, 0, FUSO);
  return new Date(alvo.getTime()).toISOString();
}

/** Segunda-feira 00h00 da semana corrente, em São Paulo (PRD 2.9). */
export function inicioDaSemana(agora: Date): Date {
  return new Date(startOfWeek(noFuso(agora), { weekStartsOn: 1 }).getTime());
}

/** Diferença em dias entre dois dias AAAA-MM-DD (b − a). */
export function diasEntre(a: string, b: string): number {
  const utc = (dia: string) => {
    const [ano, mes, d] = dia.split('-').map(Number);
    return Date.UTC(ano, mes - 1, d);
  };
  return Math.round((utc(b) - utc(a)) / 86_400_000);
}
