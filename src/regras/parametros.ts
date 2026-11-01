import type { ChaveParametro } from '@/dados/tipos';

/** RF11: mensagens por campo; objeto vazio quando está tudo certo. */
export function validarParametros(v: Record<ChaveParametro, number>): Partial<Record<ChaveParametro, string>> {
  const erros: Partial<Record<ChaveParametro, string>> = {};
  const inteiroEntre = (n: number, min: number, max: number) => Number.isInteger(n) && n >= min && n <= max;
  if (!inteiroEntre(v.limite_inatividade_horas, 1, 720)) erros.limite_inatividade_horas = 'Use um número inteiro de 1 a 720';
  if (!inteiroEntre(v.janela_motor, 3, 20)) erros.janela_motor = 'Use um número inteiro de 3 a 20';
  if (!(v.limiar_subida >= 1 && v.limiar_subida <= 100)) erros.limiar_subida = 'Use um valor de 1 a 100';
  if (!(v.limiar_descida >= 0 && v.limiar_descida <= 99)) erros.limiar_descida = 'Use um valor de 0 a 99';
  else if (v.limiar_descida >= v.limiar_subida) erros.limiar_descida = 'O limiar de descida precisa ser menor que o de subida';
  return erros;
}
