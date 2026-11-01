import { useQuery } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import { chaves } from './chaves';

export const useNotificacoes = (habilitado = true) =>
  useQuery({ queryKey: chaves.notificacoes, queryFn: () => repositorios.notificacoes.minhasNotificacoes(), enabled: habilitado });

/** Quantidade de notificações não lidas (o sino do topo). */
export function useNaoLidas(habilitado = true): number {
  const { data } = useNotificacoes(habilitado);
  return data?.filter((n) => !n.lida).length ?? 0;
}
