/** Matiz (dentro da família azul) de cada trilha, usado nas variáveis de cor do cartão e do cabeçalho. */
const MATIZ: Record<string, number> = {
  'orcamento-pessoal': 265,
  'juros-compostos': 235,
  'cartao-de-credito': 290,
  'inflacao-e-investimentos': 205,
};

export const matizDaTrilha = (slug: string) => MATIZ[slug] ?? 265;
