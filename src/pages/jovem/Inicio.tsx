import { Calculator, CreditCard, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import { SeloStatus } from '@/components/SeloStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useLicoes, useTrilhas } from '@/hooks/dados/useConteudo';
import { useMinhasRespostas, useProgressoDasTrilhas, useProgressos } from '@/hooks/dados/useProgresso';
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
    <div className="space-y-4">
      <h1 className="sr-only">Início</h1>

      {/* 1. Continuar de onde parei */}
      {!continuacao ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : (
        <Card>
          <CardHeader><CardTitle>Continuar de onde parei</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {continuacao.tipo === 'continuar' && (
              <>
                <div>
                  <p className="font-medium">{continuacao.trilha.titulo}</p>
                  <p className="text-sm text-muted-foreground">Lição {continuacao.licao.ordem} de 3: {continuacao.licao.titulo}</p>
                </div>
                <Progress
                  value={((mapa.get(continuacao.trilha.id)?.licoesConcluidas ?? 0) / 3) * 100}
                  aria-label={`Progresso: ${mapa.get(continuacao.trilha.id)?.licoesConcluidas ?? 0} de 3 lições`}
                />
                <p className="text-sm text-muted-foreground tabular-nums">{mapa.get(continuacao.trilha.id)?.licoesConcluidas ?? 0} de 3 lições concluídas</p>
                <Button asChild>
                  <Link to={`/trilhas/${continuacao.trilha.slug}/licoes/${continuacao.licao.ordem}${continuacao.acao === 'quiz' ? '/quiz' : ''}`}>
                    {continuacao.acao === 'quiz' ? 'Continuar: fazer o quiz' : 'Continuar: ler a lição'}
                  </Link>
                </Button>
              </>
            )}
            {continuacao.tipo === 'comecar' && (
              <>
                <p className="font-medium">Comece por: {continuacao.trilha.titulo}</p>
                <p className="text-sm text-muted-foreground">{continuacao.trilha.descricao}</p>
                <Button asChild><Link to={`/trilhas/${continuacao.trilha.slug}/licoes/1`}>Começar</Link></Button>
              </>
            )}
            {continuacao.tipo === 'todas_concluidas' && (
              <>
                <p className="font-medium">Você concluiu todas as trilhas!</p>
                <Button asChild><Link to="/pos-teste">Ir para o teste final</Link></Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* 2. Suas trilhas */}
      {!pronto ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <Card>
          <CardHeader><CardTitle>Suas trilhas</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {(trilhas.data ?? []).map((trilha) => {
                const p = mapa.get(trilha.id);
                const concluidas = p?.licoesConcluidas ?? 0;
                return (
                  <li key={trilha.id}>
                    <Link to={`/trilhas/${trilha.slug}`} className="block space-y-2 rounded-lg p-2 hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{trilha.titulo}</span>
                        {p && <SeloStatus status={p.status} />}
                      </div>
                      <Progress value={(concluidas / 3) * 100} aria-label={`Progresso: ${concluidas} de 3 lições`} />
                      <p className="text-sm text-muted-foreground tabular-nums">{concluidas} de 3 lições</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 3. Simuladores */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator aria-hidden="true" className="size-5 text-primary" />Simuladores</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" className="h-auto min-h-14 flex-col gap-1 py-3 whitespace-normal">
            <Link to="/simuladores/juros-compostos"><TrendingUp aria-hidden="true" />Juros compostos</Link>
          </Button>
          <Button asChild variant="outline" className="h-auto min-h-14 flex-col gap-1 py-3 whitespace-normal">
            <Link to="/simuladores/cartao-de-credito"><CreditCard aria-hidden="true" />Fatura do cartão</Link>
          </Button>
        </CardContent>
      </Card>

      {/* 4. Próxima conquista e ranking (passos 14 e 15) e 5. Teste final (passo 13) entram junto com essas funções. */}
    </div>
  );
}
