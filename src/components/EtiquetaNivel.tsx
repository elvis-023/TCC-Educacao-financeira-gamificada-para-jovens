import { SignalHigh, SignalLow, SignalMedium } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Nivel } from '@/dados/tipos';
import { ROTULO_NIVEL } from '@/lib/rotulos';

const ICONE = { facil: SignalLow, medio: SignalMedium, dificil: SignalHigh } as const;

/** Nível com ícone e texto, em cor neutra: nunca verde ou vermelho, para não parecer acerto ou erro. */
export function EtiquetaNivel({ nivel, prefixo }: { nivel: Nivel; prefixo?: string }) {
  const Icone = ICONE[nivel];
  return (
    <Badge variant="outline" className="gap-1">
      <Icone aria-hidden="true" className="size-3.5" />
      {prefixo ? `${prefixo} ${ROTULO_NIVEL[nivel]}` : ROTULO_NIVEL[nivel]}
    </Badge>
  );
}
