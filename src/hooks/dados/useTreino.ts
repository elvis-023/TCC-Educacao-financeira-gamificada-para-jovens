import { useQuery } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import { chaves } from './chaves';

/** Quantas questões o treino já pode usar e quanto XP de treino a pessoa ganhou hoje. */
export const useEstadoTreino = () => useQuery({ queryKey: chaves.treino, queryFn: () => repositorios.treino.estado() });
