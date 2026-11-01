import { useQuery } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import { chaves } from './chaves';

export const useTrilhas = () => useQuery({ queryKey: chaves.trilhas, queryFn: () => repositorios.conteudo.listarTrilhas(), staleTime: Infinity });
export const useLicoes = () => useQuery({ queryKey: chaves.licoes, queryFn: () => repositorios.conteudo.listarLicoes(), staleTime: Infinity });
export const useQuizzes = () => useQuery({ queryKey: chaves.quizzes, queryFn: () => repositorios.conteudo.listarQuizzes(), staleTime: Infinity });
export const useBadges = () => useQuery({ queryKey: chaves.badges, queryFn: () => repositorios.conteudo.listarBadges(), staleTime: Infinity });
