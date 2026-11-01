import type { ComponentProps } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { MENSAGEM_TRILHA_OFFLINE } from '@/components/AvisoSemInternet';
import { useTrilhaIndisponivel } from '@/hooks/useConexao';

type Props = Omit<ComponentProps<typeof Link>, 'to'> & { trilhaId: string; slug: string };

/** Link para uma trilha: sem internet e sem download, avisa em vez de abrir (PRD 2.4). */
export function LinkTrilha({ trilhaId, slug, onClick, ...props }: Props) {
  const indisponivel = useTrilhaIndisponivel(trilhaId);
  return (
    <Link
      {...props}
      to={`/trilhas/${slug}`}
      onClick={(evento) => {
        if (indisponivel) {
          evento.preventDefault();
          toast(MENSAGEM_TRILHA_OFFLINE, { id: 'trilha-offline' });
          return;
        }
        onClick?.(evento);
      }}
    />
  );
}
