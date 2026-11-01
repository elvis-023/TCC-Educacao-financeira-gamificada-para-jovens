import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { useEstadoTreino } from '@/hooks/dados/useTreino';
import { TETO_XP_TREINO_DIARIO } from '@/regras/treino';

/** Atalho do Início para o Modo Treino: revisão repetível das lições já concluídas. */
export function CardTreino() {
  const { data, isPending } = useEstadoTreino();
  if (isPending) return <Skeleton className="h-24 w-full rounded-3xl" />;

  const liberado = (data?.questoesDisponiveis ?? 0) > 0;
  return (
    <Link
      to={liberado ? '/treino' : '/trilhas'}
      className="flex items-center gap-4 rounded-3xl bg-card p-4 shadow-xs ring-1 ring-foreground/10 focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-destaque text-destaque-foreground">
        <Dumbbell aria-hidden="true" className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading font-semibold">Treino</span>
        <span className="block text-sm text-muted-foreground">
          {liberado
            ? <>Revise com questões novas, quando quiser. <span className="tabular-nums">XP de hoje: {data?.xpHoje ?? 0} de {TETO_XP_TREINO_DIARIO}</span></>
            : 'Conclua o quiz de uma lição para liberar o treino.'}
        </span>
      </span>
    </Link>
  );
}
