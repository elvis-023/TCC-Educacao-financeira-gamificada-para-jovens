import { Medal } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRanking } from '@/hooks/dados/useRanking';
import { formatarXp } from '@/lib/formatacao';

/** Metade direita do 4º card do Início (PRD T07): a posição do jovem no ranking geral. */
export function CardPosicaoRanking() {
  const { data, isPending } = useRanking('geral');
  if (isPending) return <Skeleton className="h-36 w-full rounded-3xl" />;

  const minha = data?.find((l) => l.ehVoce);
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Medal aria-hidden="true" className="size-4 text-xp-icone" />Ranking</CardTitle>
      </CardHeader>
      <CardContent>
        <Link to="/ranking" className="block space-y-1 rounded-lg focus-visible:outline-2 focus-visible:outline-ring">
          {minha ? (
            <>
              <span className="block text-2xl font-semibold tabular-nums">{minha.posicao}º lugar</span>
              <span className="block text-sm text-muted-foreground tabular-nums">de {data!.length} · {formatarXp(minha.xp)}</span>
            </>
          ) : (
            <span className="block text-sm text-muted-foreground">Ver o ranking</span>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
