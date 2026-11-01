import type { Nivel, StatusTrilha } from '@/dados/tipos';

export const ROTULO_NIVEL: Record<Nivel, string> = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

export const ROTULO_STATUS: Record<StatusTrilha, string> = {
  nao_iniciada: 'Não iniciada',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
};
