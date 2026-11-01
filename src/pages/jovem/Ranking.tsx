import { Medal } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { SeloDados } from '@/components/SeloDados';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { PeriodoRanking } from '@/dados/repositorios/contratos';
import type { LinhaRanking } from '@/dados/tipos';
import { useRanking } from '@/hooks/dados/useRanking';
import { formatarHora, formatarXp } from '@/lib/formatacao';

const MEDALHAS = ['text-amber-500', 'text-slate-400', 'text-orange-700'];

function Linha({ linha, fixa = false }: { linha: LinhaRanking; fixa?: boolean }) {
  const medalha = linha.posicao <= 3 ? MEDALHAS[linha.posicao - 1] : null;
  return (
    <div
      className={`flex min-h-12 items-center gap-3 rounded-lg px-3 py-2 ${linha.ehVoce ? 'bg-primary/10 font-semibold ring-1 ring-primary/40' : medalha ? 'bg-muted/50' : ''} ${fixa ? 'bg-background shadow-md' : ''}`}
    >
      <span className="flex w-10 shrink-0 items-center gap-1 tabular-nums">
        {medalha && <Medal aria-hidden="true" className={`size-4 ${medalha}`} />}
        <span>{linha.posicao}º</span>
      </span>
      <span className="min-w-0 flex-1 truncate">{linha.nomeExibicao}{linha.ehVoce ? ' (você)' : ''}</span>
      <span className="shrink-0 tabular-nums">{formatarXp(linha.xp)}</span>
    </div>
  );
}

export function Ranking() {
  const [periodo, setPeriodo] = useState<PeriodoRanking>('geral');
  const consulta = useRanking(periodo);
  const linhas = consulta.data ?? [];
  const minha = linhas.find((l) => l.ehVoce);

  const minhaRef = useRef<HTMLLIElement | null>(null);
  const [minhaVisivel, setMinhaVisivel] = useState(true);
  useLayoutEffect(() => {
    const alvo = minhaRef.current;
    if (!alvo || typeof IntersectionObserver === 'undefined') return;
    const observador = new IntersectionObserver(([entrada]) => setMinhaVisivel(entrada.isIntersecting));
    observador.observe(alvo);
    return () => observador.disconnect();
  }, [minha?.nomeExibicao, linhas.length]);

  // Troca de posição animada (FLIP): guarda a posição vertical de cada linha e anima até zero em 250 ms.
  const itens = useRef(new Map<string, HTMLLIElement>());
  const antes = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    for (const [chave, el] of itens.current) {
      const anterior = antes.current.get(chave);
      const atual = el.getBoundingClientRect().top;
      if (anterior !== undefined && Math.abs(anterior - atual) > 1) {
        el.animate([{ transform: `translateY(${anterior - atual}px)` }, { transform: 'translateY(0)' }], { duration: 250, easing: 'ease-out' });
      }
      antes.current.set(chave, atual);
    }
  });

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <h1 className="sr-only">Ranking</h1>
        <SeloDados variante="ranking" />
        <ToggleGroup type="single" variant="outline" value={periodo} onValueChange={(v) => v && setPeriodo(v as PeriodoRanking)} aria-label="Período do ranking">
          <ToggleGroupItem value="geral" className="min-h-11 px-4">Geral</ToggleGroupItem>
          <ToggleGroupItem value="semana" className="min-h-11 px-4">Esta semana</ToggleGroupItem>
        </ToggleGroup>
      </header>

      {consulta.isPending ? (
        <div className="space-y-2" aria-label="Carregando ranking">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : consulta.isError && linhas.length === 0 ? (
        <p role="alert">Não foi possível carregar o ranking. Confira a conexão e tente de novo.</p>
      ) : (
        <>
          <ol className="space-y-1">
            {linhas.map((linha, i) => {
              // Nomes de exibição podem repetir ("Ana L."): o índice entre os iguais mantém a chave única e estável.
              const repeticao = linhas.slice(0, i).filter((l) => l.nomeExibicao === linha.nomeExibicao).length;
              const chave = `${periodo}-${linha.nomeExibicao}-${repeticao}`;
              return (
                <li
                  key={chave}
                  ref={(el) => {
                    if (linha.ehVoce) minhaRef.current = el;
                    if (el) itens.current.set(chave, el);
                    else itens.current.delete(chave);
                  }}
                >
                  <Linha linha={linha} />
                </li>
              );
            })}
          </ol>
          <p className="text-sm text-muted-foreground tabular-nums">Atualizado às {formatarHora(new Date(consulta.dataUpdatedAt))}</p>
        </>
      )}

      {minha && !minhaVisivel && (
        <div className="fixed inset-x-0 bottom-16 z-10 mx-auto w-full max-w-md px-4" aria-hidden="true">
          <Linha linha={minha} fixa />
        </div>
      )}
    </section>
  );
}
