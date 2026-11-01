import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import type { Simulacao } from '@/dados/tipos';
import { chaves } from './chaves';

export const useSimulacoes = () => useQuery({ queryKey: chaves.simulacoes, queryFn: () => repositorios.simulacoes.minhasSimulacoes() });

export function useSalvarSimulacao() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (simulacao: Pick<Simulacao, 'tipoSimulacao' | 'parametros' | 'resultadoFinal'>) => repositorios.simulacoes.salvar(simulacao),
    onSuccess: () => cliente.invalidateQueries({ queryKey: chaves.simulacoes }),
  });
}
