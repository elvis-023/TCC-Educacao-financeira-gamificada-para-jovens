import { Circle, CircleCheck, CircleDashed } from 'lucide-react';
import type { StatusTrilha } from '@/dados/tipos';
import { ROTULO_STATUS } from '@/lib/rotulos';

const ICONE = { nao_iniciada: Circle, em_andamento: CircleDashed, concluida: CircleCheck } as const;

/** Status da trilha com ícone e texto: nunca só pela cor (RNF07). */
export function SeloStatus({ status }: { status: StatusTrilha }) {
  const Icone = ICONE[status];
  return (
    <span className={`inline-flex items-center gap-1 text-sm ${status === 'concluida' ? 'text-acerto' : 'text-muted-foreground'}`}>
      <Icone aria-hidden="true" className="size-4" />
      {ROTULO_STATUS[status]}
    </span>
  );
}
