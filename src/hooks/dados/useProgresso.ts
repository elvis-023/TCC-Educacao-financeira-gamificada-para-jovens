import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import type { ProgressoTrilha } from '@/dados/tipos';
import { calcularProgressoTrilha } from '@/regras/progresso';
import { chaves } from './chaves';
import { useTrilhas } from './useConteudo';

export const useProgressos = () => useQuery({ queryKey: chaves.progresso, queryFn: () => repositorios.progresso.meusProgressos() });
export const useMinhasRespostas = () => useQuery({ queryKey: chaves.respostas, queryFn: () => repositorios.progresso.minhasRespostas() });

export function useConcluirLeitura() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (licaoId: string) => repositorios.progresso.concluirLeitura(licaoId),
    onSuccess: () =>
      Promise.all([
        cliente.invalidateQueries({ queryKey: chaves.progresso }),
        cliente.invalidateQueries({ queryKey: chaves.respostas }),
        cliente.invalidateQueries({ queryKey: chaves.usuario }),
      ]),
  });
}

/** Progresso de cada trilha (status, lições concluídas, nível atual), pelo id da trilha. */
export function useProgressoDasTrilhas() {
  const trilhas = useTrilhas();
  const progressos = useProgressos();
  const respostas = useMinhasRespostas();
  const carregando = trilhas.isPending || progressos.isPending || respostas.isPending;
  const mapa = new Map<string, ProgressoTrilha>();
  if (!carregando) {
    for (const t of trilhas.data ?? []) mapa.set(t.id, calcularProgressoTrilha(t.id, progressos.data ?? [], respostas.data ?? [], 5));
  }
  return { carregando, mapa };
}
