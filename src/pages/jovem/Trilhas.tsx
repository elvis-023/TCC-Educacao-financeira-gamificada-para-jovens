import { CircleCheck } from 'lucide-react';
import { EtiquetaNivel } from '@/components/EtiquetaNivel';
import { LinkTrilha } from '@/components/LinkTrilha';
import { SeloStatus } from '@/components/SeloStatus';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrilhas } from '@/hooks/dados/useConteudo';
import { useProgressoDasTrilhas } from '@/hooks/dados/useProgresso';
import { useTrilhasBaixadas } from '@/hooks/useConexao';

export function Trilhas() {
  const { data: trilhas, isPending } = useTrilhas();
  const { carregando, mapa } = useProgressoDasTrilhas();
  const baixadas = useTrilhasBaixadas();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Trilhas</h1>
      {isPending || carregando ? (
        <div className="space-y-3" aria-label="Carregando trilhas">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      ) : (
        <ul className="space-y-3">
          {trilhas?.map((trilha) => {
            const p = mapa.get(trilha.id);
            const concluidas = p?.licoesConcluidas ?? 0;
            return (
              <li key={trilha.id}>
                <LinkTrilha trilhaId={trilha.id} slug={trilha.slug} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardHeader className="space-y-2">
                      <CardTitle>{trilha.titulo}</CardTitle>
                      <CardDescription>{trilha.descricao}</CardDescription>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {p && <SeloStatus status={p.status} />}
                        <span className="text-sm text-muted-foreground">3 lições</span>
                        {p && p.status !== 'nao_iniciada' && <EtiquetaNivel nivel={p.nivelAtual} prefixo="Nível:" />}
                        {baixadas.includes(trilha.id) && (
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <CircleCheck aria-hidden="true" className="size-4" />
                            Disponível offline
                          </span>
                        )}
                      </div>
                      <Progress value={(concluidas / 3) * 100} aria-label={`Progresso: ${concluidas} de 3 lições`} />
                    </CardHeader>
                  </Card>
                </LinkTrilha>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
