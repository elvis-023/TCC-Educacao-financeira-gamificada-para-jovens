import { useSyncExternalStore } from 'react';
import { assinarAparelho, lerAparelho } from '@/dados/aparelho';

const assinar = (aoMudar: () => void) => {
  window.addEventListener('online', aoMudar);
  window.addEventListener('offline', aoMudar);
  return () => {
    window.removeEventListener('online', aoMudar);
    window.removeEventListener('offline', aoMudar);
  };
};

/** Estado da conexão do navegador (PRD 2.4, modo offline). */
export const useConexao = () => useSyncExternalStore(assinar, () => navigator.onLine, () => true);

/** Sem internet, uma trilha não baixada não abre (PRD 2.4). */
export function useTrilhaIndisponivel(trilhaId: string | undefined): boolean {
  const online = useConexao();
  const baixadas = useTrilhasBaixadas();
  return !online && Boolean(trilhaId) && !baixadas.includes(trilhaId!);
}

/** Trilhas baixadas neste aparelho (estado do aparelho, PRD 6.4). */
export const useTrilhasBaixadas = () =>
  useSyncExternalStore(assinarAparelho, () => lerAparelho().trilhasBaixadas, () => []);
