import { Calculator, CreditCard, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Simulacao } from '@/dados/tipos';
import { useSimulacoes } from '@/hooks/dados/useSimulacoes';
import { formatarData, formatarMoeda, formatarPercentual } from '@/lib/formatacao';

function resumo(s: Simulacao): string {
  if (s.tipoSimulacao === 'juros_compostos') {
    const p = s.parametros;
    const taxa = `${formatarPercentual(p.taxaPercentual)} ao ${p.unidadeTaxa === 'mes' ? 'mês' : 'ano'}`;
    return `${formatarMoeda(p.valorInicial)} + ${formatarMoeda(p.aporteMensal)}/mês · ${taxa} · ${p.prazo} ${p.unidadePrazo} → ${formatarMoeda(s.resultadoFinal)}`;
  }
  const p = s.parametros;
  return `Fatura de ${formatarMoeda(p.valorFatura)} · mínimo de ${formatarMoeda(p.pagamentoMinimo)} · ${p.parcelas} parcelas → ${formatarMoeda(s.resultadoFinal)}`;
}

export function Simuladores() {
  const { data: simulacoes, isPending } = useSimulacoes();

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold">Simuladores</h1>

      <div className="grid gap-3">
        <Link to="/simuladores/juros-compostos" className="block rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp aria-hidden="true" className="size-5 text-primary" />Juros compostos</CardTitle>
              <CardDescription>Veja o seu dinheiro crescer com juros sobre juros</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/simuladores/cartao-de-credito" className="block rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard aria-hidden="true" className="size-5 text-primary" />Fatura do cartão</CardTitle>
              <CardDescription>Compare pagar o total com pagar só o mínimo</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Últimas simulações</h2>
        {isPending ? (
          <div className="space-y-2" aria-label="Carregando simulações">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : !simulacoes?.length ? (
          <p className="flex items-center gap-2 text-muted-foreground"><Calculator aria-hidden="true" className="size-4" />Você ainda não fez nenhuma simulação.</p>
        ) : (
          <ul className="space-y-2">
            {simulacoes.map((s) => {
              const Icone = s.tipoSimulacao === 'juros_compostos' ? TrendingUp : CreditCard;
              const destino = s.tipoSimulacao === 'juros_compostos' ? '/simuladores/juros-compostos' : '/simuladores/cartao-de-credito';
              return (
                <li key={s.id}>
                  <Link
                    to={destino}
                    state={{ parametros: s.parametros }}
                    className="flex min-h-14 items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <Icone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span className="flex-1 text-sm tabular-nums">{resumo(s)}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatarData(s.criadaEm)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
