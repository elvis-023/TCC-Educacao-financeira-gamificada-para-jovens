import { ArrowLeft, CircleCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLicoes, useTrilhas } from '@/hooks/dados/useConteudo';
import { useConcluirLeitura, useProgressos } from '@/hooks/dados/useProgresso';
import { estadoDaLicao } from '@/regras/progresso';
import { NaoEncontrada } from '@/pages/NaoEncontrada';
import { MENSAGEM_BLOQUEIO } from './Trilha';

export function Licao() {
  const { trilha: slug, licao: ordemTexto } = useParams();
  const navigate = useNavigate();
  const trilhas = useTrilhas();
  const licoes = useLicoes();
  const progressos = useProgressos();
  const concluirLeitura = useConcluirLeitura();
  const titulo = useRef<HTMLHeadingElement>(null);

  const trilha = trilhas.data?.find((t) => t.slug === slug);
  const daTrilha = (licoes.data ?? []).filter((l) => l.trilhaId === trilha?.id).sort((a, b) => a.ordem - b.ordem);
  const licao = daTrilha.find((l) => String(l.ordem) === ordemTexto);
  const estado = licao ? estadoDaLicao(licao, daTrilha, progressos.data ?? []) : null;
  const carregando = trilhas.isPending || licoes.isPending || progressos.isPending;

  useEffect(() => {
    if (licao) titulo.current?.focus();
  }, [licao]);
  useEffect(() => {
    if (estado === 'bloqueada') toast(MENSAGEM_BLOQUEIO, { id: 'licao-bloqueada' });
  }, [estado]);

  if (carregando) {
    return (
      <div className="space-y-3" aria-label="Carregando lição">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (!trilha || !licao) return <NaoEncontrada />;
  // Regra 6 (PRD 4.4): lição bloqueada aberta pela URL volta para a trilha.
  if (estado === 'bloqueada') return <Navigate to={`/trilhas/${trilha.slug}`} replace />;

  const proxima = daTrilha.find((l) => l.ordem === licao.ordem + 1);
  const concluida = estado === 'concluida';

  async function aoConcluirLeitura() {
    if (!licao || !trilha) return;
    try {
      await concluirLeitura.mutateAsync(licao.id);
      navigate(`/trilhas/${trilha.slug}/licoes/${licao.ordem}/quiz`);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível registrar a leitura');
    }
  }

  return (
    <article className="space-y-5 pb-32">
      <header className="space-y-3">
        <Link to={`/trilhas/${trilha.slug}`} className="inline-flex min-h-11 items-center gap-1 text-sm text-primary">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar à trilha
        </Link>
        <p className="text-sm text-muted-foreground">
          {trilha.titulo} · <span className="tabular-nums">Lição {licao.ordem} de 3</span> · <span className="tabular-nums">{licao.tempoLeituraMin} min de leitura</span>
        </p>
        <h1 ref={titulo} tabIndex={-1} className="text-2xl font-semibold outline-none">{licao.titulo}</h1>
      </header>

      {licao.conteudo.map((bloco, i) => {
        if (bloco.tipo === 'texto') return <p key={i} className="leading-relaxed">{bloco.texto}</p>;
        if (bloco.tipo === 'exemplo') {
          return (
            <Card key={i} className="border-primary/40 bg-primary/5">
              <CardHeader>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">Exemplo prático</p>
                <CardTitle className="text-base">{bloco.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 tabular-nums">
                  {bloco.linhas.map((linha) => <li key={linha}>{linha}</li>)}
                </ul>
              </CardContent>
            </Card>
          );
        }
        return (
          <section key={i} className="space-y-2 rounded-xl border p-4">
            <h2 className="font-semibold">Resumo</h2>
            <ul className="list-disc space-y-1 pl-5">
              {bloco.itens.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        );
      })}

      <div className="fixed bottom-0 left-1/2 z-10 w-full max-w-[430px] -translate-x-1/2 border-t bg-background p-4">
        {concluida ? (
          <div className="space-y-2">
            <p className="flex items-center justify-center gap-1 font-medium text-acerto">
              <CircleCheck aria-hidden="true" className="size-4" />
              Lição concluída
            </p>
            <div className="flex gap-2">
              {proxima && (
                <Button asChild className="flex-1"><Link to={`/trilhas/${trilha.slug}/licoes/${proxima.ordem}`}>Próxima lição</Link></Button>
              )}
              <Button asChild variant="outline" className={proxima ? '' : 'flex-1'}><Link to={`/trilhas/${trilha.slug}`}>Voltar à trilha</Link></Button>
            </div>
          </div>
        ) : (
          <Button className="w-full" size="lg" onClick={aoConcluirLeitura} disabled={concluirLeitura.isPending}>
            Concluir leitura e fazer o quiz
          </Button>
        )}
      </div>
    </article>
  );
}
