import { Trophy } from 'lucide-react';
import { Link } from 'react-router';
import { IconeConquista } from '@/components/IconeConquista';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSituacaoConquistas } from '@/hooks/dados/useConquistas';
import { useBadges } from '@/hooks/dados/useConteudo';
import { proximaConquista } from '@/regras/gamificacao';

/** Metade esquerda do 4º card do Início (PRD T07): a próxima conquista a desbloquear. */
export function CardProximaConquista() {
  const badges = useBadges();
  const { carregando, situacao, conquistadas } = useSituacaoConquistas();
  if (carregando || badges.isPending || !situacao) return <Skeleton className="h-36 w-full rounded-xl" />;

  const proxima = proximaConquista(badges.data ?? [], conquistadas, situacao);
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Trophy aria-hidden="true" className="size-4 text-xp-icone" />Próxima conquista</CardTitle>
      </CardHeader>
      <CardContent>
        <Link to="/conquistas" className="block space-y-1 rounded-lg focus-visible:outline-2 focus-visible:outline-ring">
          {proxima ? (
            <>
              <span className="flex items-center gap-2 font-medium"><IconeConquista nome={proxima.badge.icone} className="size-5 text-muted-foreground" />{proxima.badge.nome}</span>
              <span className="block text-sm text-muted-foreground">{proxima.badge.criterioMarco}</span>
              {proxima.progresso && <span className="block text-sm font-medium tabular-nums">{proxima.progresso}</span>}
            </>
          ) : (
            <>
              <span className="block font-medium">Todas conquistadas!</span>
              <span className="block text-sm text-muted-foreground">Ver as 6 conquistas</span>
            </>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
