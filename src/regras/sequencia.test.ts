import { describe, expect, it } from 'vitest';
import { diaNoFuso } from '@/lib/fuso';
import { atualizarSequencia, deveGerarLembrete, horasDeInatividade, sequenciaAtual } from './sequencia';

describe('sequência de dias (RN04)', () => {
  it('RN04: mesmo dia não muda; dia seguinte soma; depois de um dia sem uso volta a 1', () => {
    expect(atualizarSequencia(4, '2026-11-03', '2026-11-03')).toEqual({ diasStreak: 4, ultimoDiaUso: '2026-11-03' });
    expect(atualizarSequencia(4, '2026-11-03', '2026-11-04')).toEqual({ diasStreak: 5, ultimoDiaUso: '2026-11-04' });
    expect(atualizarSequencia(4, '2026-11-02', '2026-11-04')).toEqual({ diasStreak: 1, ultimoDiaUso: '2026-11-04' });
    expect(atualizarSequencia(0, null, '2026-11-04')).toEqual({ diasStreak: 1, ultimoDiaUso: '2026-11-04' });
  });
  it('RN04: dia de uso no fuso de Brasília — 22h30 de 10/03 (01h30 UTC de 11/03) conta para 10/03', () => {
    const hoje = diaNoFuso(new Date('2026-03-11T01:30:00Z'));
    expect(hoje).toBe('2026-03-10');
    expect(atualizarSequencia(2, '2026-03-09', hoje).diasStreak).toBe(3);
  });
  it('RN04: a sequência vale até o fim de hoje e zera quando um dia termina sem uso', () => {
    expect(sequenciaAtual(4, '2026-11-04', '2026-11-04')).toBe(4);
    expect(sequenciaAtual(4, '2026-11-03', '2026-11-04')).toBe(4);
    expect(sequenciaAtual(4, '2026-11-02', '2026-11-04')).toBe(0);
    expect(sequenciaAtual(0, null, '2026-11-04')).toBe(0);
  });
});

describe('lembrete por inatividade (RF09, RN04)', () => {
  const base = { receberLembretes: true, temTrilhaEmAndamento: true, ultimaAtividadeEm: '2026-11-01T23:00:00.000Z', ultimoLembreteEm: null, limiteHoras: 48 };
  it('conta as horas desde a última atividade', () => {
    expect(horasDeInatividade('2026-11-01T23:00:00.000Z', new Date('2026-11-03T23:00:00.000Z'))).toBe(48);
  });
  it('RF09: só passa do limite depois de 48 h, com trilha iniciada e a opção ligada', () => {
    expect(deveGerarLembrete({ ...base, agora: new Date('2026-11-03T23:00:00.000Z') })).toBe(false); // exatamente 48 h
    expect(deveGerarLembrete({ ...base, agora: new Date('2026-11-03T23:01:00.000Z') })).toBe(true);
    expect(deveGerarLembrete({ ...base, receberLembretes: false, agora: new Date('2026-11-05T00:00:00.000Z') })).toBe(false);
    expect(deveGerarLembrete({ ...base, temTrilhaEmAndamento: false, agora: new Date('2026-11-05T00:00:00.000Z') })).toBe(false);
  });
  it('RF09: um lembrete por período de inatividade', () => {
    const agora = new Date('2026-11-05T00:00:00.000Z');
    expect(deveGerarLembrete({ ...base, ultimoLembreteEm: '2026-11-04T00:00:00.000Z', agora })).toBe(false);
    expect(deveGerarLembrete({ ...base, ultimoLembreteEm: '2026-11-01T22:00:00.000Z', agora })).toBe(true);
  });
});
