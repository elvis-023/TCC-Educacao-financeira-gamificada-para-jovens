import { atualizarAparelho, lerAparelho } from '@/dados/aparelho';

export function agora(): Date {
  return new Date(Date.now() + lerAparelho().deslocamentoRelogioMs);
}

export function avancarRelogio(horas: number): void {
  atualizarAparelho({ deslocamentoRelogioMs: lerAparelho().deslocamentoRelogioMs + horas * 3_600_000 });
}

export function zerarRelogio(): void {
  atualizarAparelho({ deslocamentoRelogioMs: 0 });
}
