import { describe, expect, it } from 'vitest';
import { diaNoFuso } from '@/lib/fuso';
import { criarDadosDemo } from '.';
import { ID_ALEX } from './usuarios';

const agora = new Date('2026-11-04T15:00:00Z'); // quarta-feira, 12h00 em São Paulo

describe('dados de demonstração (PRD 6.3, 6.4, 6.7)', () => {
  const banco = criarDadosDemo(agora);
  const alex = banco.usuarios.find((u) => u.id === ID_ALEX)!;

  it('12 jovens e 1 administrador', () => {
    expect(banco.usuarios.filter((u) => u.papel === 'jovem')).toHaveLength(12);
    expect(banco.usuarios.filter((u) => u.papel === 'admin')).toHaveLength(1);
  });
  it('Alex: 120 XP, igual à soma das respostas, sequência de 4 dias até ontem', () => {
    const soma = banco.respostasQuiz.filter((r) => r.usuarioId === ID_ALEX).reduce((s, r) => s + r.xpGanho, 0);
    expect(alex.xpTotal).toBe(120);
    expect(soma).toBe(120);
    expect(alex.diasStreak).toBe(4);
    expect(alex.ultimoDiaUso).toBe(diaNoFuso(new Date('2026-11-03T15:00:00Z')));
  });
  it('Alex: 4 quizzes concluídos, nenhum com 3 acertos, e as 2 conquistas', () => {
    const doAlex = banco.progressos.filter((p) => p.usuarioId === ID_ALEX);
    expect(doAlex.filter((p) => p.quizConcluidoEm)).toHaveLength(4);
    expect(doAlex.every((p) => p.acertos < 3)).toBe(true);
    expect(banco.usuarioBadges.map((b) => b.badgeId).sort()).toEqual(['primeira_trilha', 'primeiro_quiz']);
  });
  it('pesquisa: 12 pré-testes, 5 pós-testes, pseudônimos únicos e notas do PRD', () => {
    expect(banco.testes.filter((t) => t.tipoTeste === 'pre')).toHaveLength(12);
    expect(banco.testes.filter((t) => t.tipoTeste === 'pos')).toHaveLength(5);
    expect(new Set(Object.values(banco.pseudonimos)).size).toBe(12);
    const preAlex = banco.testes.find((t) => t.pseudonimo === banco.pseudonimos[ID_ALEX] && t.tipoTeste === 'pre')!;
    expect(preAlex.pontuacaoTotal).toBe(1);
    expect(banco.respostasTeste).toHaveLength(51);
  });
});
