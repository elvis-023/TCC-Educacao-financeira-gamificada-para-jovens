import { useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chaves } from './dados/chaves';
import { ContextoSessao } from './contextoSessao';

/** Atualiza a sessão em cache e só então devolve, para navegar já com a sessão certa (evita voltar para /entrar). */
export function useAtualizarSessao() {
  const cliente = useQueryClient();
  return () => cliente.refetchQueries({ queryKey: chaves.sessao });
}

export function useSessao() {
  const contexto = useContext(ContextoSessao);
  if (!contexto) throw new Error('useSessao precisa do ProvedorSessao');
  return contexto;
}
