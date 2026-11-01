import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import type { ChaveParametro, QuestaoEditavel } from '@/dados/tipos';
import { chaves } from './chaves';

const chave = (...partes: string[]) => [...chaves.admin, ...partes];

export const useMetricasPesquisa = () => useQuery({ queryKey: chave('metricas'), queryFn: () => repositorios.admin.metricasPesquisa() });
export const useExportacao = () => useQuery({ queryKey: chave('exportacao'), queryFn: () => repositorios.admin.exportarRespostas() });
export const useQuestoesAdmin = () => useQuery({ queryKey: chave('questoes'), queryFn: () => repositorios.admin.listarQuestoes() });
export const useParametrosAtuais = () => useQuery({ queryKey: chave('parametros'), queryFn: () => repositorios.admin.parametrosAtuais() });
export const useHistoricoParametros = () => useQuery({ queryKey: chave('historico'), queryFn: () => repositorios.admin.historicoParametros() });

export function useSalvarQuestao() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (questao: QuestaoEditavel) => repositorios.admin.salvarQuestao(questao),
    onSuccess: () => cliente.invalidateQueries({ queryKey: chave('questoes') }),
  });
}

export function useSalvarParametros() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (valores: Record<ChaveParametro, number>) => repositorios.admin.salvarParametros(valores),
    onSuccess: () => Promise.all([cliente.invalidateQueries({ queryKey: chave('parametros') }), cliente.invalidateQueries({ queryKey: chave('historico') })]),
  });
}
