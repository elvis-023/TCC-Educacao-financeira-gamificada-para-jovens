import { describe, expect, it } from 'vitest';
import { diaNoFuso, diasEntre, inicioDaSemana } from './fuso';
import {
  formatarData, formatarDataHora, formatarHora, formatarMoeda, formatarPercentual,
  formatarPercentualInteiro, formatarPontosPercentuais, formatarXp, paraNumero,
} from './formatacao';

const semEspacoEspecial = (s: string) => s.replace(/\s/g, ' ');

describe('formatos pt-BR (PRD 5.7)', () => {
  it('moeda R$ 1.234,56, arredondando só na exibição', () => {
    expect(semEspacoEspecial(formatarMoeda(1234.56))).toBe('R$ 1.234,56');
    expect(semEspacoEspecial(formatarMoeda(2395.075331451668))).toBe('R$ 2.395,08');
  });
  it('percentuais, XP e pontos percentuais', () => {
    expect(formatarPercentual(10)).toBe('10,00%');
    expect(formatarPercentualInteiro(100 / 3)).toBe('33%');
    expect(formatarXp(1234)).toBe('1.234 XP');
    expect(formatarPontosPercentuais(200 / 3)).toBe('+67 p.p.');
    expect(formatarPontosPercentuais(-100 / 3)).toBe('−33 p.p.');
    expect(formatarPontosPercentuais(0)).toBe('0 p.p.');
    expect(formatarPontosPercentuais(80 / 3, 1)).toBe('+26,7 p.p.');
  });
  it('datas no fuso de São Paulo: 01h30 UTC de 11/03 ainda é 10/03 em Brasília', () => {
    const instante = new Date('2026-03-11T01:30:00Z');
    expect(formatarData(instante)).toBe('10/03/2026');
    expect(formatarHora(instante)).toBe('22:30');
    expect(formatarDataHora(instante)).toBe('10/03/2026 às 22:30');
    expect(diaNoFuso(instante)).toBe('2026-03-10');
  });
  it('semana de segunda a domingo em São Paulo e diferença de dias', () => {
    expect(inicioDaSemana(new Date('2026-11-04T18:00:00Z')).toISOString()).toBe('2026-11-02T03:00:00.000Z');
    expect(diasEntre('2026-10-31', '2026-11-01')).toBe(1);
  });
  it('lê número digitado com vírgula', () => {
    expect(paraNumero('10,5')).toBe(10.5);
    expect(paraNumero('1.234,56')).toBe(1234.56);
    expect(paraNumero('')).toBeNull();
    expect(paraNumero('abc')).toBeNull();
  });
});
