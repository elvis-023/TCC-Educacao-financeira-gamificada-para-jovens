import type { BlocoConteudo } from '@/dados/tipos';
import * as cartaoDeCredito from './cartaoDeCredito';
import * as inflacaoEInvestimentos from './inflacaoEInvestimentos';
import * as jurosCompostos from './jurosCompostos';
import * as orcamentoPessoal from './orcamentoPessoal';

/** Conteúdo de cada lição, pelo id da lição. */
export const CONTEUDO: Record<string, BlocoConteudo[]> = {
  ...orcamentoPessoal.conteudo,
  ...jurosCompostos.conteudo,
  ...cartaoDeCredito.conteudo,
  ...inflacaoEInvestimentos.conteudo,
};
/** Minutos de leitura de cada lição, pelo id da lição. */
export const TEMPO_DE_LEITURA: Record<string, number> = {
  ...orcamentoPessoal.tempos,
  ...jurosCompostos.tempos,
  ...cartaoDeCredito.tempos,
  ...inflacaoEInvestimentos.tempos,
};
