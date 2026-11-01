import { Lock } from 'lucide-react';
import { IconeConquista } from '@/components/IconeConquista';
import { Skeleton } from '@/components/ui/skeleton';
import { useConquistas, useSituacaoConquistas } from '@/hooks/dados/useConquistas';
import { useBadges } from '@/hooks/dados/useConteudo';
import { formatarData } from '@/lib/formatacao';
import { textoDeProgresso } from '@/regras/gamificacao';

export function Conquistas() {
  const badges = useBadges();
  const conquistas = useConquistas();
  const { carregando, situacao } = useSituacaoConquistas();

  if (badges.isPending || conquistas.isPending || carregando || !situacao) {
    return (
      <div className="grid grid-cols-2 gap-3" aria-label="Carregando conquistas">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
      </div>
    );
  }

  const lista = [...(badges.data ?? [])].sort((a, b) => a.ordem - b.ordem);
  const obtidas = conquistas.data ?? [];
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tabular-nums">{obtidas.length} de {lista.length} conquistas</h1>
      <ul className="grid grid-cols-2 gap-3">
        {lista.map((b) => {
          const ganha = obtidas.find((c) => c.badgeId === b.id);
          return (
            <li key={b.id} className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center ${ganha ? 'border-xp-icone/50 bg-xp-icone/10' : 'bg-muted/30'}`}>
              <IconeConquista nome={b.icone} className={`size-10 ${ganha ? 'text-xp-icone' : 'text-muted-foreground'}`} />
              <p className="font-medium">{b.nome}</p>
              {ganha ? (
                <p className="text-sm text-muted-foreground tabular-nums">Conquistada em {formatarData(ganha.conquistadoEm)}</p>
              ) : (
                <>
                  <p className="flex items-center gap-1 text-sm font-medium text-muted-foreground"><Lock aria-hidden="true" className="size-3.5" />Bloqueada</p>
                  <p className="text-sm text-muted-foreground">{b.criterioMarco}</p>
                  <p className="text-sm font-medium tabular-nums">{textoDeProgresso(b.id, situacao)}</p>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
