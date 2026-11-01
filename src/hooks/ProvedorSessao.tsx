import { useEffect, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import { chaves } from './dados/chaves';
import { ContextoSessao } from './contextoSessao';

export function ProvedorSessao({ children }: { children: ReactNode }) {
  const clienteConsultas = useQueryClient();
  const consulta = useQuery({ queryKey: chaves.sessao, queryFn: () => repositorios.sessao.sessaoAtual(), staleTime: Infinity });
  useEffect(() => repositorios.sessao.observar(() => void clienteConsultas.invalidateQueries()), [clienteConsultas]);
  return <ContextoSessao.Provider value={{ sessao: consulta.data ?? null, carregando: consulta.isPending }}>{children}</ContextoSessao.Provider>;
}
