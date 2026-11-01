import type { PerguntaDiagnostica, Questao, QuestaoEditavel } from '@/dados/tipos';
import { normalizarTexto } from '@/lib/texto';

/** RF10: devolve a mensagem do primeiro problema, ou null. `todas` é o banco antes da mudança. */
export function validarQuestao(q: QuestaoEditavel, todas: Questao[], diagnosticas: PerguntaDiagnostica[]): string | null {
  if (new Set(q.alternativas.map(normalizarTexto)).size < 4) return 'As 4 alternativas precisam ser diferentes';
  if (diagnosticas.some((d) => normalizarTexto(d.enunciado) === normalizarTexto(q.enunciado))) {
    return 'Este enunciado é igual a uma pergunta do teste diagnóstico';
  }
  const depois = [...todas.filter((x) => x.id !== q.id), { ...q, id: q.id ?? 'nova' }];
  const quizzesDaLicao1 = new Set(todas.map((x) => x.quizId).filter((id) => id.endsWith('-1-quiz')));
  for (const quizId of quizzesDaLicao1) {
    if (depois.filter((x) => x.quizId === quizId && x.ativa).length < 3) return 'A lição 1 de cada trilha precisa de pelo menos 3 questões ativas';
  }
  return null;
}
