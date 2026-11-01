import { describe, expect, it } from 'vitest';
import { normalizarTexto } from '@/lib/texto';
import { criarDadosDemo } from '.';
import { ESTRUTURA_QUESTOES } from './estruturaQuestoes';
import { PERGUNTAS_DIAGNOSTICAS } from './perguntasDiagnosticas';
import { QUESTOES } from './questoes';
import { ID_ALEX } from './usuarios';

describe('banco de questões (PRD 6.6)', () => {
  it('48 questões com os ids, quizzes e níveis da estrutura', () => {
    expect(QUESTOES).toHaveLength(48);
    const porId = new Map(QUESTOES.map((q) => [q.id, q]));
    for (const item of ESTRUTURA_QUESTOES) {
      expect(porId.get(item.id)).toMatchObject({ quizId: item.quizId, nivelDificuldade: item.nivel, ativa: true });
    }
  });
  it('3 Fácil, 6 Médio e 3 Difícil por trilha', () => {
    for (const trilha of ['orcamento-pessoal', 'juros-compostos', 'cartao-de-credito', 'inflacao-e-investimentos']) {
      const nivelDe = (nivel: string) => QUESTOES.filter((q) => q.id.startsWith(trilha) && q.nivelDificuldade === nivel).length;
      expect([nivelDe('facil'), nivelDe('medio'), nivelDe('dificil')]).toEqual([3, 6, 3]);
    }
  });
  it.each(QUESTOES.map((q) => [q.id, q] as const))('%s: alternativas, correta e tamanhos válidos', (_id, q) => {
    expect(new Set(q.alternativas.map(normalizarTexto)).size).toBe(4);
    expect([0, 1, 2, 3]).toContain(q.respostaCorreta);
    expect(q.enunciado.length).toBeGreaterThanOrEqual(10);
    expect(q.enunciado.length).toBeLessThanOrEqual(300);
    expect(q.explicacao.length).toBeGreaterThanOrEqual(10);
    expect(q.explicacao.length).toBeLessThanOrEqual(400);
  });
  it('a alternativa correta varia de posição (nenhuma posição passa de 14 das 48)', () => {
    for (const posicao of [0, 1, 2, 3]) {
      const quantas = QUESTOES.filter((q) => q.respostaCorreta === posicao).length;
      expect(quantas).toBeGreaterThanOrEqual(10);
      expect(quantas).toBeLessThanOrEqual(14);
    }
  });
  it('nenhuma questão repete uma pergunta do teste diagnóstico', () => {
    const diagnosticas = PERGUNTAS_DIAGNOSTICAS.map((p) => normalizarTexto(p.enunciado));
    for (const q of QUESTOES) expect(diagnosticas).not.toContain(normalizarTexto(q.enunciado));
  });
  it('o histórico do jovem principal aponta para questões reais, com nível e alternativa coerentes', () => {
    const banco = criarDadosDemo(new Date('2026-11-04T15:00:00Z'));
    for (const r of banco.respostasQuiz.filter((x) => x.usuarioId === ID_ALEX)) {
      const q = QUESTOES.find((x) => x.id === r.questaoId)!;
      expect(q.nivelDificuldade).toBe(r.nivelQuestao);
      expect(r.alternativaMarcada === q.respostaCorreta).toBe(r.acertou);
    }
  });
});
