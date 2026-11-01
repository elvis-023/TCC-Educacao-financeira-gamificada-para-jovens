import { Medal } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useMorph } from '@/hooks/useMorph';
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
      className={`flex min-h-14 items-center gap-3 rounded-2xl px-4 py-2 ${linha.ehVoce ? 'bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/25' : 'bg-card shadow-xs ring-1 ring-foreground/10'} ${fixa ? 'shadow-xl' : ''}`}
    >
      <span className="numero flex w-11 shrink-0 items-center gap-1">
        {medalha && <Medal aria-hidden="true" className={`size-4 ${linha.ehVoce ? 'text-destaque' : medalha}`} />}
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

  // Layout animation (GSAP Flip): as linhas trocam de lugar quando a ordem muda; a pílula do período desliza.
  const lista = useRef<HTMLOListElement>(null);
  const cabecalho = useRef<HTMLElement>(null);
  useMorph(lista, [linhas.map((l) => `${l.nomeExibicao}:${l.posicao}`).join('|')], { duracao: 0.55, ease: 'power3.inOut' });
  useMorph(cabecalho, [periodo], { duracao: 0.4, ease: 'back.out(1.3)' });

  return (
    <section className="space-y-4">
      <header ref={cabecalho} className="space-y-3">
        <h1 className="sr-only">Ranking</h1>
        <SeloDados variante="ranking" />
        <ToggleGroup type="single" variant="default" spacing={1} className="w-full rounded-full bg-secondary p-1" value={periodo} onValueChange={(v) => v && setPeriodo(v as PeriodoRanking)} aria-label="Período do ranking">
          {(['geral', 'semana'] as const).map((valor) => (
            <ToggleGroupItem key={valor} value={valor} className="relative min-h-11 flex-1 rounded-full px-4 font-semibold data-[state=on]:bg-transparent data-[state=on]:text-primary-foreground">
              {periodo === valor && <span data-flip-id="pilula-periodo" aria-hidden="true" className="absolute inset-0 rounded-full bg-primary" />}
              <span className="relative">{valor === 'geral' ? 'Geral' : 'Esta semana'}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </header>

      {consulta.isPending ? (
        <div className="space-y-2" aria-label="Carregando ranking">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : consulta.isError && linhas.length === 0 ? (
        <p role="alert">Não foi possível carregar o ranking. Confira a conexão e tente de novo.</p>
      ) : (
        <>
          <ol ref={lista} className="space-y-2">
            {linhas.map((linha, i) => {
              // Nomes de exibição podem repetir ("Ana L."): o índice entre os iguais mantém a chave única e estável.
              const repeticao = linhas.slice(0, i).filter((l) => l.nomeExibicao === linha.nomeExibicao).length;
              const chave = `${linha.nomeExibicao}-${repeticao}`;
              return (
                <li
                  key={chave}
                  data-flip-id={`linha-${chave}`}
                  ref={(el) => {
                    if (linha.ehVoce) minhaRef.current = el;
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
        <div className="fixed inset-x-0 bottom-24 z-10 mx-auto w-full max-w-md px-4" aria-hidden="true">
          <Linha linha={minha} fixa />
        </div>
      )}
    </section>
  );
}
