import { z } from 'zod';
import { normalizarTexto } from '@/lib/texto';

const alternativa = z.string().trim().min(1, 'Escreva a alternativa').max(150, 'Use no máximo 150 caracteres');

/** Formulário da questão (PRD T21). O quizId sai da lição escolhida (`<lição>-quiz`). */
export const esquemaQuestao = z
  .object({
    trilhaId: z.string().min(1, 'Escolha a trilha'),
    licaoId: z.string().min(1, 'Escolha a lição'),
    nivel: z.enum(['facil', 'medio', 'dificil'], { error: 'Escolha o nível' }),
    enunciado: z.string().trim().min(10, 'Use pelo menos 10 caracteres').max(300, 'Use no máximo 300 caracteres'),
    alt0: alternativa,
    alt1: alternativa,
    alt2: alternativa,
    alt3: alternativa,
    correta: z.enum(['0', '1', '2', '3'], { error: 'Marque a alternativa correta' }),
    explicacao: z.string().trim().min(10, 'Use pelo menos 10 caracteres').max(400, 'Use no máximo 400 caracteres'),
    ativa: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (new Set([v.alt0, v.alt1, v.alt2, v.alt3].map(normalizarTexto)).size < 4) {
      ctx.addIssue({ code: 'custom', path: ['alt0'], message: 'As 4 alternativas precisam ser diferentes' });
    }
  });

export type FormularioQuestao = z.input<typeof esquemaQuestao>;
