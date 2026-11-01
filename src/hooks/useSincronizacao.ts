import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { repositorios } from '@/dados/repositorios';
import { chaves } from './dados/chaves';
import { useConexao } from './useConexao';

/** Quando a conexão volta, marca o progresso feito offline como sincronizado e avisa (PRD 2.4). */
export function useSincronizacao() {
  const online = useConexao();
  const cliente = useQueryClient();
  const estavaOnline = useRef(online);

  useEffect(() => {
    const voltou = !estavaOnline.current && online;
    estavaOnline.current = online;
    if (!voltou) return;
    repositorios.progresso.sincronizarPendentes()
      .then((quantidade) => {
        if (quantidade <= 0) return;
        toast.success('Conexão de volta. Progresso sincronizado.');
        void cliente.invalidateQueries({ queryKey: chaves.progresso });
      })
      .catch(() => undefined);
  }, [online, cliente]);
}
