import { z } from 'zod';
import type { EntradaFatura, EntradaJuros } from '@/dados/tipos';
import { formatarMoeda, paraNumero } from '@/lib/formatacao';
import { ErroSemRotativo } from '@/regras/simuladores';

const campoMoeda = (obrigatorio: string, maximo: number) =>
  z.number({ error: obrigatorio }).min(0, 'O valor não pode ser negativo').max(maximo, `Use no máximo ${formatarMoeda(maximo)}`);

const campoTaxa = (obrigatorio: string) =>
  z.string().trim().min(1, obrigatorio)
    .refine((t) => !t.startsWith('-'), 'A taxa não pode ser negativa')
    .refine((t) => /^\d{1,3}(,\d{1,2})?$/.test(t), 'Use até 2 casas decimais, com vírgula (ex.: 10,50)')
    .refine((t) => (paraNumero(t) ?? 0) <= 100, 'A taxa deve ser de no máximo 100%');

export const esquemaJuros = z.object({
  valorInicial: campoMoeda('Informe o valor inicial', 10_000_000),
  aporteMensal: campoMoeda('Informe o aporte mensal', 1_000_000),
  taxa: campoTaxa('Informe a taxa de juros'),
  unidadeTaxa: z.enum(['mes', 'ano']),
  prazo: z.string().trim().min(1, 'Informe o prazo').regex(/^\d+$/, 'Use um número inteiro'),
  unidadePrazo: z.enum(['meses', 'anos']),
}).superRefine((v, ctx) => {
  const meses = v.unidadePrazo === 'anos' ? Number(v.prazo) * 12 : Number(v.prazo);
  if (meses < 1) ctx.addIssue({ code: 'custom', path: ['prazo'], message: 'O prazo mínimo é de 1 mês' });
  if (meses > 600) ctx.addIssue({ code: 'custom', path: ['prazo'], message: 'O prazo máximo é de 50 anos (600 meses)' });
  if (v.valorInicial === 0 && v.aporteMensal === 0) {
    ctx.addIssue({ code: 'custom', path: ['valorInicial'], message: 'Informe um valor inicial ou um aporte maior que zero' });
  }
});
export type FormularioJuros = z.input<typeof esquemaJuros>;
export const paraEntradaJuros = (v: z.output<typeof esquemaJuros>): EntradaJuros => ({
  valorInicial: v.valorInicial, aporteMensal: v.aporteMensal, taxaPercentual: paraNumero(v.taxa)!,
  unidadeTaxa: v.unidadeTaxa, prazo: Number(v.prazo), unidadePrazo: v.unidadePrazo,
});

export const esquemaFatura = z.object({
  valorFatura: z.number({ error: 'Informe o valor da fatura' }).positive('O valor precisa ser maior que zero').max(1_000_000, 'Use no máximo R$ 1.000.000,00'),
  pagamentoMinimo: z.number({ error: 'Informe o pagamento mínimo' }).positive('O valor precisa ser maior que zero'),
  taxaRotativo: campoTaxa('Informe a taxa do rotativo'),
  taxaParcelamento: campoTaxa('Informe a taxa do parcelamento'),
  parcelas: z.number({ error: 'Escolha o número de parcelas' }).int().min(2, 'Escolha de 2 a 24 parcelas').max(24, 'Escolha de 2 a 24 parcelas'),
}).superRefine((v, ctx) => {
  if (v.pagamentoMinimo >= v.valorFatura) ctx.addIssue({ code: 'custom', path: ['pagamentoMinimo'], message: new ErroSemRotativo().message });
});
export type FormularioFatura = z.input<typeof esquemaFatura>;
export const paraEntradaFatura = (v: z.output<typeof esquemaFatura>): EntradaFatura => ({
  valorFatura: v.valorFatura, pagamentoMinimo: v.pagamentoMinimo, taxaRotativoPercentual: paraNumero(v.taxaRotativo)!,
  taxaParcelamentoPercentual: paraNumero(v.taxaParcelamento)!, parcelas: v.parcelas,
});
