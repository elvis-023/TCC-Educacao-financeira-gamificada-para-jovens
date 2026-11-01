import { useQuery } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import { chaves } from './chaves';

export const useMeuUsuario = (habilitado = true) =>
  useQuery({ queryKey: chaves.usuario, queryFn: () => repositorios.usuario.meuUsuario(), enabled: habilitado });
