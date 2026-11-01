import { describe, expect, it } from 'vitest';
import { criarDadosDemo } from '@/dados/demo';
import { ID_ALEX } from '@/dados/demo/usuarios';
import { registrarAtividade } from './comum';

describe('atividade e sequência no modo local (RN04)', () => {
  const agora = new Date('2026-11-04T15:00:00Z'); // quarta-feira, 12h00 em São Paulo; o jovem principal usou o app ontem

  it('RN04: a primeira atividade do dia soma 1 à sequência e a segunda não muda', () => {
    const banco = criarDadosDemo(agora);
    registrarAtividade(banco, ID_ALEX, agora);
    const alex = banco.usuarios.find((u) => u.id === ID_ALEX)!;
    expect(alex.diasStreak).toBe(5);
    expect(alex.ultimoDiaUso).toBe('2026-11-04');
    expect(alex.ultimaAtividadeEm).toBe(agora.toISOString());
    registrarAtividade(banco, ID_ALEX, new Date('2026-11-04T18:00:00Z'));
    expect(alex.diasStreak).toBe(5);
  });
  it('RN04: depois de um dia sem uso, a sequência volta a 1', () => {
    const banco = criarDadosDemo(agora);
    registrarAtividade(banco, ID_ALEX, new Date('2026-11-06T15:00:00Z'));
    expect(banco.usuarios.find((u) => u.id === ID_ALEX)!.diasStreak).toBe(1);
  });
});
