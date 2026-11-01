import { WifiOff } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export const MENSAGEM_TRILHA_OFFLINE = 'Para abrir esta trilha, conecte-se à internet.';

/** Aviso no lugar do conteúdo de uma trilha não baixada, sem internet (PRD 2.4). */
export function AvisoSemInternet({ voltarPara }: { voltarPara: string }) {
  return (
    <section role="alert" className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 text-center">
      <WifiOff aria-hidden="true" className="size-8 text-muted-foreground" />
      <h1 className="text-xl font-semibold">{MENSAGEM_TRILHA_OFFLINE}</h1>
      <Button asChild variant="outline"><Link to={voltarPara}>Voltar</Link></Button>
    </section>
  );
}
