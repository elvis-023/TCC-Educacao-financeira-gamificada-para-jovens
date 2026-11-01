import type { ChaveParametro, ParametroSistema } from '@/dados/tipos';
import { instanteRelativo } from '@/lib/fuso';

export const PARAMETROS_PADRAO: Record<ChaveParametro, number> = {
  limite_inatividade_horas: 48,
  janela_motor: 5,
  limiar_subida: 80,
  limiar_descida: 40,
};

export function criarParametros(agora: Date): ParametroSistema[] {
  return (Object.keys(PARAMETROS_PADRAO) as ChaveParametro[]).map((chave) => ({
    id: `padrao-${chave}`, chave, valor: PARAMETROS_PADRAO[chave], alteradoPor: null, alteradoEm: instanteRelativo(agora, 30, 9, 0),
  }));
}
