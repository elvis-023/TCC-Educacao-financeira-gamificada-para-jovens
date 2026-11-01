import { WifiOff } from 'lucide-react';
import { useConexao } from '@/hooks/useConexao';

/** Faixa fixa quando não há internet (PRD 2.4). Anunciada ao leitor de tela. */
export function BannerOffline() {
  const online = useConexao();
  if (online) return null;
  return (
    <div role="status" className="flex items-center gap-2 bg-foreground px-4 py-2 text-sm text-background">
      <WifiOff aria-hidden="true" className="size-4 shrink-0" />
      Você está sem internet. As trilhas baixadas continuam disponíveis.
    </div>
  );
}
