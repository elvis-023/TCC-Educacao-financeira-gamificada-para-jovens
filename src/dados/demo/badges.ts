import type { Badge } from '@/dados/tipos';

export const BADGES: Badge[] = [
  { id: 'primeiro_quiz', nome: 'Primeiro Quiz', criterioMarco: 'Conclua seu primeiro quiz', icone: 'CircleCheck', ordem: 1 },
  { id: 'primeira_trilha', nome: 'Primeira Trilha', criterioMarco: 'Conclua todas as lições de uma trilha', icone: 'Flag', ordem: 2 },
  { id: 'sequencia_7_dias', nome: 'Sequência de 7 dias', criterioMarco: 'Estude 7 dias seguidos', icone: 'Flame', ordem: 3 },
  { id: 'gabaritou', nome: 'Gabaritou', criterioMarco: 'Acerte as 3 questões de um quiz', icone: 'Target', ordem: 4 },
  { id: 'desafio_aceito', nome: 'Desafio Aceito', criterioMarco: 'Chegue ao nível Difícil em uma trilha', icone: 'Mountain', ordem: 5 },
  { id: 'mestre_das_financas', nome: 'Mestre das Finanças', criterioMarco: 'Conclua as 4 trilhas', icone: 'Crown', ordem: 6 },
];
