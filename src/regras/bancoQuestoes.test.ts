import { describe, expect, it } from 'vitest';
import { PERGUNTAS_DIAGNOSTICAS } from '@/dados/demo/perguntasDiagnosticas';
import { QUESTOES } from '@/dados/demo/questoes';
import type { QuestaoEditavel } from '@/dados/tipos';
import { validarQuestao } from './bancoQuestoes';

const editavel = (id: string): QuestaoEditavel => {
  const q = QUESTOES.find((x) => x.id === id)!;
  return { id: q.id, quizId: q.quizId, enunciado: q.enunciado, alternativas: q.alternativas, respostaCorreta: q.respostaCorreta, nivelDificuldade: q.nivelDificuldade, explicacao: q.explicacao, ativa: q.ativa };
};

describe('banco de questões (RF10)', () => {
  it('RF10: aceita uma edição comum', () => {
    expect(validarQuestao(editavel('juros-compostos-2-m1'), QUESTOES, PERGUNTAS_DIAGNOSTICAS)).toBeNull();
  });
  it('RF10: a lição 1 de cada trilha mantém pelo menos 3 questões ativas', () => {
    const semUma = QUESTOES.map((q) => (q.id === 'juros-compostos-1-f1' ? { ...q, ativa: false } : q));
    expect(validarQuestao({ ...editavel('juros-compostos-1-m1'), ativa: false }, semUma, PERGUNTAS_DIAGNOSTICAS))
      .toBe('A lição 1 de cada trilha precisa de pelo menos 3 questões ativas');
    expect(validarQuestao({ ...editavel('juros-compostos-1-m1'), quizId: 'juros-compostos-2-quiz' }, semUma, PERGUNTAS_DIAGNOSTICAS))
      .toBe('A lição 1 de cada trilha precisa de pelo menos 3 questões ativas');
  });
  it('RF05: enunciado igual a uma pergunta do teste diagnóstico é bloqueado', () => {
    const copia = { ...editavel('juros-compostos-2-m1'), enunciado: PERGUNTAS_DIAGNOSTICAS[0].enunciado.toUpperCase() };
    expect(validarQuestao(copia, QUESTOES, PERGUNTAS_DIAGNOSTICAS)).toBe('Este enunciado é igual a uma pergunta do teste diagnóstico');
  });
  it('RF10: as 4 alternativas precisam ser diferentes', () => {
    const repetida = { ...editavel('juros-compostos-2-m1'), alternativas: ['A', 'a', 'B', 'C'] as [string, string, string, string] };
    expect(validarQuestao(repetida, QUESTOES, PERGUNTAS_DIAGNOSTICAS)).toBe('As 4 alternativas precisam ser diferentes');
  });
});
