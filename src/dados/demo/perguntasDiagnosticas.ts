import type { PerguntaDiagnostica } from '@/dados/tipos';

export const VERSAO_TESTE = '1.0';

export const PERGUNTAS_DIAGNOSTICAS: PerguntaDiagnostica[] = [
  { id: 'A-1', forma: 'A', versao: VERSAO_TESTE, numero: 1, enunciado: 'Suponha que você tenha R$ 100 numa poupança e que a taxa de juros seja de 2% ao ano. Depois de 5 anos, quanto você teria na conta se deixasse o dinheiro render?', alternativas: ['Mais de R$ 102', 'Exatamente R$ 102', 'Menos de R$ 102', 'Não sei'], alternativaCorreta: 0 },
  { id: 'A-2', forma: 'A', versao: VERSAO_TESTE, numero: 2, enunciado: 'Suponha que a taxa de juros da poupança seja de 1% ao ano e a inflação de 2% ao ano. Depois de 1 ano, você conseguiria comprar mais, exatamente o mesmo ou menos do que hoje com o dinheiro dessa conta?', alternativas: ['Mais', 'Exatamente o mesmo', 'Menos', 'Não sei'], alternativaCorreta: 2 },
  { id: 'A-3', forma: 'A', versao: VERSAO_TESTE, numero: 3, enunciado: 'Verdadeiro ou falso: comprar ações de uma única empresa normalmente oferece um retorno mais seguro do que um fundo de ações.', alternativas: ['Verdadeiro', 'Falso', 'Não sei'], alternativaCorreta: 1 },
  { id: 'B-1', forma: 'B', versao: VERSAO_TESTE, numero: 1, enunciado: 'Suponha que você tenha R$ 200 numa poupança e que a taxa de juros seja de 3% ao ano. Depois de 5 anos, quanto você teria na conta se deixasse o dinheiro render?', alternativas: ['Mais de R$ 206', 'Exatamente R$ 206', 'Menos de R$ 206', 'Não sei'], alternativaCorreta: 0 },
  { id: 'B-2', forma: 'B', versao: VERSAO_TESTE, numero: 2, enunciado: 'Suponha que a taxa de juros da poupança seja de 2% ao ano e a inflação de 4% ao ano. Depois de 1 ano, você conseguiria comprar mais, exatamente o mesmo ou menos do que hoje com o dinheiro dessa conta?', alternativas: ['Mais', 'Exatamente o mesmo', 'Menos', 'Não sei'], alternativaCorreta: 2 },
  { id: 'B-3', forma: 'B', versao: VERSAO_TESTE, numero: 3, enunciado: 'Verdadeiro ou falso: investir todo o dinheiro em um único ativo costuma ser mais seguro do que dividi-lo entre vários ativos.', alternativas: ['Verdadeiro', 'Falso', 'Não sei'], alternativaCorreta: 1 },
];
