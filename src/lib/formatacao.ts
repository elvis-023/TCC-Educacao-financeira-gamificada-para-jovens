import { format } from 'date-fns';
import { noFuso } from './fuso';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const moedaCompacta = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });
const duasCasas = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const umaCasa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

export const formatarMoeda = (valor: number) => moeda.format(valor);
export const formatarMoedaCompacta = (valor: number) => moedaCompacta.format(valor);
export const formatarDecimal = (valor: number) => duasCasas.format(valor);
export const formatarPercentual = (percentual: number) => `${duasCasas.format(percentual)}%`;
export const formatarPercentualInteiro = (percentual: number) => `${inteiro.format(percentual)}%`;
export const formatarXp = (xp: number) => `${inteiro.format(xp)} XP`;

export function formatarPontosPercentuais(pp: number, casas: 0 | 1 = 0): string {
  const arredondado = Number(pp.toFixed(casas));
  const fmt = casas === 1 ? umaCasa : inteiro;
  if (arredondado === 0) return `${fmt.format(0)} p.p.`;
  return `${arredondado > 0 ? '+' : '−'}${fmt.format(Math.abs(arredondado))} p.p.`;
}

export const formatarData = (instante: Date | string) => format(noFuso(instante), 'dd/MM/yyyy');
export const formatarHora = (instante: Date | string) => format(noFuso(instante), 'HH:mm');
export const formatarDataHora = (instante: Date | string) => `${formatarData(instante)} às ${formatarHora(instante)}`;

/** Converte texto digitado em pt-BR ("1.234,56") em número; vazio ou inválido vira null. */
export function paraNumero(texto: string): number | null {
  const limpo = texto.trim().replace(/\./g, '').replace(',', '.');
  if (limpo === '') return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}
