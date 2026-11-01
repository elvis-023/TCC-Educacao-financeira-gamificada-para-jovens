import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import type { PeriodoRanking } from '@/dados/repositorios/contratos';
import { chaves } from './chaves';

/** Offline, a última classificação continua na tela: é o cache do TanStack Query (PRD 2.9). */
export const useRanking = (periodo: PeriodoRanking) =>
  useQuery({ queryKey: [...chaves.ranking, periodo], queryFn: () => repositorios.ranking.ranking(periodo), placeholderData: keepPreviousData });
