import type { RepositorioRanking } from '../contratos';
import { cliente, traduzirErro } from './comum';

interface LinhaCrua { posicao: number | string; nome_exibicao: string; xp: number | string; eh_voce: boolean }

// A função `ranking` do banco devolve só posição, nome de exibição, XP e se a linha é de quem pediu (RNF04).
export const rankingSupabase: RepositorioRanking = {
  async ranking(periodo) {
    const { data, error } = await cliente().rpc('ranking', { p_periodo: periodo });
    if (error) throw new Error(traduzirErro(error));
    return ((data ?? []) as LinhaCrua[]).map((l) => ({ posicao: Number(l.posicao), nomeExibicao: l.nome_exibicao, xp: Number(l.xp), ehVoce: l.eh_voce }));
  },
};
