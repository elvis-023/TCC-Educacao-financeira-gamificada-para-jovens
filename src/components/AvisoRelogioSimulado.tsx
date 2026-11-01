import { useSyncExternalStore } from 'react';
import { Badge } from '@/components/ui/badge';
import { assinarAparelho, lerAparelho } from '@/dados/aparelho';

/** Selo discreto no topo quando a demonstração avançou o relógio (PRD 2.11). */
export function AvisoRelogioSimulado() {
  const deslocamento = useSyncExternalStore(assinarAparelho, () => lerAparelho().deslocamentoRelogioMs);
  if (deslocamento === 0) return null;
  const horas = Math.round(deslocamento / 3_600_000);
  return <Badge variant="outline" className="whitespace-nowrap tabular-nums">Relógio simulado: {horas > 0 ? '+' : ''}{horas} h</Badge>;
}
