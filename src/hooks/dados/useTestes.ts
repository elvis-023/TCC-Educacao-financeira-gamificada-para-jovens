import { useQuery } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import { chaves } from './chaves';

export const useMeusTestes = (habilitado = true) =>
  useQuery({ queryKey: chaves.testes, queryFn: () => repositorios.testes.meusTestes(), enabled: habilitado });

/** Regra de acesso 3 (PRD 4.4): o pré-teste concluído libera a área do jovem. */
export function usePreTesteConcluido(habilitado: boolean) {
  const { data, isPending } = useMeusTestes(habilitado);
  return {
    carregando: habilitado && isPending,
    concluido: Boolean(data?.some((t) => t.tipoTeste === 'pre' && t.concluidoEm !== null)),
  };
}
