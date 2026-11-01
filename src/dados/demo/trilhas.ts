import type { Licao, Quiz, Trilha } from '@/dados/tipos';
import { CONTEUDO, TEMPO_DE_LEITURA } from './licoes';

export const TRILHAS: Trilha[] = [
  { id: 'orcamento-pessoal', slug: 'orcamento-pessoal', titulo: 'Orçamento Pessoal', descricao: 'Organize o seu dinheiro e monte a sua reserva.', categoria: 'Organização', ordem: 1 },
  { id: 'juros-compostos', slug: 'juros-compostos', titulo: 'Juros Compostos', descricao: 'Juros sobre juros: faça o tempo trabalhar por você.', categoria: 'Investimentos', ordem: 2 },
  { id: 'cartao-de-credito', slug: 'cartao-de-credito', titulo: 'Cartão de Crédito', descricao: 'Use o cartão sem cair no rotativo.', categoria: 'Crédito', ordem: 3 },
  { id: 'inflacao-e-investimentos', slug: 'inflacao-e-investimentos', titulo: 'Inflação e Investimentos', descricao: 'Proteja o seu poder de compra e diversifique.', categoria: 'Investimentos', ordem: 4 },
];

const TITULOS: Record<string, [string, string, string]> = {
  'orcamento-pessoal': ['Para onde vai o seu dinheiro', 'Montando o seu orçamento', 'Reserva de emergência'],
  'juros-compostos': ['Juros simples e juros compostos', 'O tempo a seu favor', 'Taxa ao mês e taxa ao ano'],
  'cartao-de-credito': ['Como funciona a fatura', 'Mínimo e rotativo', 'Parcelamento e teto dos juros'],
  'inflacao-e-investimentos': ['O que é inflação', 'Rendimento real', 'Diversificação'],
};

export const LICOES: Licao[] = TRILHAS.flatMap((trilha) =>
  TITULOS[trilha.id].map((titulo, i) => {
    const id = `${trilha.id}-${i + 1}`;
    return { id, trilhaId: trilha.id, ordem: (i + 1) as 1 | 2 | 3, titulo, tempoLeituraMin: TEMPO_DE_LEITURA[id] ?? 4, conteudo: CONTEUDO[id] ?? [] };
  }),
);

export const QUIZZES: Quiz[] = LICOES.map((licao) => ({ id: `${licao.id}-quiz`, licaoId: licao.id, tipoAvaliacao: 'adaptativo', numeroQuestoes: 3 }));
