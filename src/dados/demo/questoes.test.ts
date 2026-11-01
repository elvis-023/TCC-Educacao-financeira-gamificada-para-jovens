import { describe, expect, it } from 'vitest';
import { normalizarTexto } from '@/lib/texto';
import { criarDadosDemo } from '.';
import { ESTRUTURA_QUESTOES, TOTAL_POR_NIVEL } from './estruturaQuestoes';
import { PERGUNTAS_DIAGNOSTICAS } from './perguntasDiagnosticas';
import { QUESTOES, QUESTOES_BASE, QUESTOES_NOVAS } from './questoes';
import { LICOES } from './trilhas';
import { ID_ALEX } from './usuarios';

const TRILHAS = ['orcamento-pessoal', 'juros-compostos', 'cartao-de-credito', 'inflacao-e-investimentos'];

describe('banco de questões (PRD 6.6)', () => {
  it('336 questões: 48 do banco inicial e 288 novas, todas com id único', () => {
    expect(QUESTOES_BASE).toHaveLength(48);
    expect(QUESTOES_NOVAS).toHaveLength(288);
    expect(QUESTOES).toHaveLength(336);
    expect(new Set(QUESTOES.map((q) => q.id)).size).toBe(336);
  });
  it('os ids, quizzes e níveis seguem a estrutura: 28 questões por lição', () => {
    expect(ESTRUTURA_QUESTOES).toHaveLength(336);
    const porId = new Map(QUESTOES.map((q) => [q.id, q]));
    for (const item of ESTRUTURA_QUESTOES) {
      expect(porId.get(item.id), item.id).toMatchObject({ quizId: item.quizId, nivelDificuldade: item.nivel, ativa: true });
    }
    for (const licao of LICOES) {
      expect(QUESTOES.filter((q) => q.quizId === `${licao.id}-quiz`)).toHaveLength(28);
    }
  });
  it('cada lição segue a proporção da estrutura e cada trilha fica com 21 Fácil, 42 Médio e 21 Difícil', () => {
    for (const licao of LICOES) {
      const nivelDe = (nivel: string) => QUESTOES.filter((q) => q.quizId === `${licao.id}-quiz` && q.nivelDificuldade === nivel).length;
      expect({ facil: nivelDe('facil'), medio: nivelDe('medio'), dificil: nivelDe('dificil') }).toEqual(TOTAL_POR_NIVEL[licao.ordem as 1 | 2 | 3]);
    }
    for (const trilha of TRILHAS) {
      const nivelDe = (nivel: string) => QUESTOES.filter((q) => q.id.startsWith(trilha) && q.nivelDificuldade === nivel).length;
      expect([nivelDe('facil'), nivelDe('medio'), nivelDe('dificil')]).toEqual([21, 42, 21]);
    }
  });
  it.each(QUESTOES.map((q) => [q.id, q] as const))('%s: alternativas, correta e tamanhos válidos', (_id, q) => {
    expect(new Set(q.alternativas.map(normalizarTexto)).size).toBe(4);
    for (const alternativa of q.alternativas) {
      expect(alternativa.trim().length).toBeGreaterThan(0);
      expect(alternativa.length).toBeLessThanOrEqual(150); // o formulário do administrador aceita até 150
    }
    expect([0, 1, 2, 3]).toContain(q.respostaCorreta);
    expect(q.enunciado.length).toBeGreaterThanOrEqual(10);
    expect(q.enunciado.length).toBeLessThanOrEqual(300);
    expect(q.explicacao.length).toBeGreaterThanOrEqual(10);
    expect(q.explicacao.length).toBeLessThanOrEqual(400);
    expect(JSON.stringify(q)).not.toMatch(/NaN|undefined|Infinity/);
  });
  it('nenhum enunciado se repete, nem o das perguntas do teste diagnóstico', () => {
    const enunciados = QUESTOES.map((q) => normalizarTexto(q.enunciado));
    expect(new Set(enunciados).size).toBe(QUESTOES.length);
    const diagnosticas = PERGUNTAS_DIAGNOSTICAS.map((p) => normalizarTexto(p.enunciado));
    for (const e of enunciados) expect(diagnosticas).not.toContain(e);
  });
  it('a alternativa correta se distribui por igual: nenhuma posição passa de 26% do banco', () => {
    for (const posicao of [0, 1, 2, 3]) {
      const quantas = QUESTOES.filter((q) => q.respostaCorreta === posicao).length;
      expect(quantas).toBeGreaterThanOrEqual(Math.floor(336 * 0.23));
      expect(quantas).toBeLessThanOrEqual(Math.ceil(336 * 0.27));
    }
    for (const posicao of [0, 1, 2, 3]) {
      expect(QUESTOES_NOVAS.filter((q) => q.respostaCorreta === posicao)).toHaveLength(72);
    }
  });
  it('a correta não se denuncia pelo tamanho: não é a mais longa em mais de 30% das questões, e nas novas nunca passa 25% da maior errada', () => {
    const estritamenteMaisLonga = (q: (typeof QUESTOES)[number]) => q.alternativas.every((a, i) => i === q.respostaCorreta || a.length < q.alternativas[q.respostaCorreta].length);
    expect(QUESTOES.filter(estritamenteMaisLonga).length / QUESTOES.length).toBeLessThan(0.3);
    for (const q of QUESTOES_NOVAS) {
      const correta = q.alternativas[q.respostaCorreta].length;
      const maiorErrada = Math.max(...q.alternativas.filter((_, i) => i !== q.respostaCorreta).map((a) => a.length));
      if (!q.alternativas.every((a) => /^(R\$|[−-]?\d)/.test(a))) expect(correta, q.id).toBeLessThanOrEqual(maiorErrada * 1.25);
    }
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
