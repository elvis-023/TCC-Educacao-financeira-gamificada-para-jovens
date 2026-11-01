import { CreditCard, TrendingUp } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { CardPosicaoRanking } from '@/components/CardPosicaoRanking';
import { CardProximaConquista } from '@/components/CardProximaConquista';
import { CardTesteFinal } from '@/components/CardTesteFinal';
import { CartaoTrilha } from '@/components/CartaoTrilha';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useLicoes, useTrilhas } from '@/hooks/dados/useConteudo';
import { useMinhasRespostas, useProgressoDasTrilhas, useProgressos } from '@/hooks/dados/useProgresso';
import { guardarElementosCompartilhados } from '@/lib/animacao';
import { matizDaTrilha } from '@/lib/matizTrilha';
import { continuarDeOndeParei } from '@/regras/progresso';

export function Inicio() {
  const trilhas = useTrilhas();
  const licoes = useLicoes();
  const progressos = useProgressos();
  const respostas = useMinhasRespostas();
  const { carregando, mapa } = useProgressoDasTrilhas();

  const pronto = !carregando && !licoes.isPending && !trilhas.isPending && !progressos.isPending && !respostas.isPending;
  const continuacao = pronto
    ? continuarDeOndeParei(trilhas.data ?? [], licoes.data ?? [], progressos.data ?? [], respostas.data ?? [])
    : null;

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Início</h1>

      {/* 1. Continuar de onde parei: o cartão abre a lição com a animação de hero (GSAP Flip) */}
      {!continuacao ? (
        <Skeleton className="h-52 w-full rounded-3xl" />
      ) : (
        <section aria-labelledby="continuar" className="space-y-3">
          {continuacao.tipo === 'continuar' ? (
            <div
              data-flip-id={`licao-${continuacao.licao.id}:linha`}
              style={{ '--matiz': matizDaTrilha(continuacao.trilha.slug) } as CSSProperties}
              className="hero-trilha space-y-4 rounded-3xl p-5"
            >
              <p id="continuar" className="text-sm opacity-90">Continuar de onde parei</p>
              <div className="flex items-center gap-3">
                <span data-flip-id={`licao-${continuacao.licao.id}:numero`} className="icone-hero flex size-12 shrink-0 items-center justify-center rounded-full font-heading text-lg font-semibold tabular-nums">
                  {continuacao.licao.ordem}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-heading text-xl font-semibold leading-tight">{continuacao.trilha.titulo}</p>
                  <p className="text-sm opacity-90">Lição {continuacao.licao.ordem} de 3: {continuacao.licao.titulo}</p>
                </div>
              </div>
              <Progress
                value={((mapa.get(continuacao.trilha.id)?.licoesConcluidas ?? 0) / 3) * 100}
                aria-label={`Progresso: ${mapa.get(continuacao.trilha.id)?.licoesConcluidas ?? 0} de 3 lições`}
                className="bg-white/25 [&>div]:bg-destaque"
              />
              <p className="text-sm tabular-nums opacity-90">{mapa.get(continuacao.trilha.id)?.licoesConcluidas ?? 0} de 3 lições concluídas</p>
              <Button asChild size="lg" className="w-full bg-destaque font-semibold text-destaque-foreground hover:bg-destaque/90">
                <Link
                  to={`/trilhas/${continuacao.trilha.slug}/licoes/${continuacao.licao.ordem}${continuacao.acao === 'quiz' ? '/quiz' : ''}`}
                  onClick={() => guardarElementosCompartilhados(`licao-${continuacao.licao.id}`)}
                >
                  {continuacao.acao === 'quiz' ? 'Continuar: fazer o quiz' : 'Continuar: ler a lição'}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="fundo-hero space-y-3 rounded-3xl p-5">
              {continuacao.tipo === 'comecar' ? (
                <>
                  <p id="continuar" className="text-sm opacity-90">Comece por aqui</p>
                  <p className="font-heading text-xl font-semibold">{continuacao.trilha.titulo}</p>
                  <p className="text-sm opacity-90">{continuacao.trilha.descricao}</p>
                  <Button asChild size="lg" className="w-full bg-destaque font-semibold text-destaque-foreground hover:bg-destaque/90">
                    <Link to={`/trilhas/${continuacao.trilha.slug}/licoes/1`}>Começar</Link>
                  </Button>
                </>
              ) : (
                <>
                  <p id="continuar" className="font-heading text-xl font-semibold">Você concluiu todas as trilhas!</p>
                  <Button asChild size="lg" className="w-full bg-destaque font-semibold text-destaque-foreground hover:bg-destaque/90">
                    <Link to="/pos-teste">Ir para o teste final</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </section>
      )}

      {/* 2. Suas trilhas */}
      <section aria-labelledby="suas-trilhas" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="suas-trilhas" className="text-lg font-semibold">Suas trilhas</h2>
          <Link to="/trilhas" className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline">Ver todas</Link>
        </div>
        {!pronto ? (
          <div className="grid grid-cols-2 gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-44 rounded-3xl" />)}</div>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {(trilhas.data ?? []).map((trilha) => (
              <li key={trilha.id}><CartaoTrilha trilha={trilha} progresso={mapa.get(trilha.id)} /></li>
            ))}
          </ul>
        )}
      </section>

      {/* 3. Simuladores */}
      <section aria-labelledby="simuladores" className="space-y-3">
        <h2 id="simuladores" className="text-lg font-semibold">Simuladores</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/simuladores/juros-compostos" className="flex min-h-24 flex-col justify-between gap-2 rounded-3xl bg-card p-4 shadow-xs ring-1 ring-foreground/10 focus-visible:outline-2 focus-visible:outline-ring">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><TrendingUp aria-hidden="true" className="size-5" /></span>
            <span className="font-medium">Juros compostos</span>
          </Link>
          <Link to="/simuladores/cartao-de-credito" className="flex min-h-24 flex-col justify-between gap-2 rounded-3xl bg-card p-4 shadow-xs ring-1 ring-foreground/10 focus-visible:outline-2 focus-visible:outline-ring">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><CreditCard aria-hidden="true" className="size-5" /></span>
            <span className="font-medium">Fatura do cartão</span>
          </Link>
        </div>
      </section>

      {/* 4. Próxima conquista (esquerda) e posição no ranking (direita) */}
      <div className="grid grid-cols-2 gap-3">
        <CardProximaConquista />
        <CardPosicaoRanking />
      </div>

      {/* 5. Teste final */}
      <CardTesteFinal />
    </div>
  );
}
