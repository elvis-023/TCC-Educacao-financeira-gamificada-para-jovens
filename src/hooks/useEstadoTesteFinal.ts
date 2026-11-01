import { useSyncExternalStore } from 'react';
import { assinarAparelho, lerAparelho } from '@/dados/aparelho';
import { MODO_DADOS } from '@/dados/repositorios';
import type { ResumoTeste } from '@/dados/tipos';
import { trilhasConcluidas } from '@/regras/progresso';
import { useProgressos } from './dados/useProgresso';
import { useMeusTestes } from './dados/useTestes';

export const TOTAL_TRILHAS = 4;

export type EstadoTesteFinal = 'bloqueado' | 'liberado' | 'liberado_demo' | 'concluido';

/** Estado do teste final (PRD T06): concluído, liberado pelas 4 trilhas, liberado pela demonstração ou bloqueado. */
export function useEstadoTesteFinal() {
  const testes = useMeusTestes();
  const progressos = useProgressos();
  const liberadoPelaDemonstracao = useSyncExternalStore(assinarAparelho, () => lerAparelho().posTesteLiberadoDemo, () => false) && MODO_DADOS === 'local';

  const carregando = testes.isPending || progressos.isPending;
  const concluidas = trilhasConcluidas(progressos.data ?? []);
  const pre: ResumoTeste | undefined = testes.data?.find((t) => t.tipoTeste === 'pre');
  const pos: ResumoTeste | undefined = testes.data?.find((t) => t.tipoTeste === 'pos');

  let estado: EstadoTesteFinal = 'bloqueado';
  if (pos?.concluidoEm) estado = 'concluido';
  else if (concluidas >= TOTAL_TRILHAS) estado = 'liberado';
  else if (liberadoPelaDemonstracao) estado = 'liberado_demo';

  return { carregando, estado, trilhasConcluidas: concluidas, pre, pos };
}
