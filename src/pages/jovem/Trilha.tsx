import { BookOpen, CircleCheck, CircleDashed, Lock, type LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';
import { AvisoSemInternet } from '@/components/AvisoSemInternet';
import { BaixarTrilha } from '@/components/BaixarTrilha';
import { EtiquetaNivel } from '@/components/EtiquetaNivel';
import { IconeTrilha } from '@/components/IconeTrilha';
import { SeloStatus } from '@/components/SeloStatus';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useLicoes, useTrilhas } from '@/hooks/dados/useConteudo';
import { useProgressoDasTrilhas, useProgressos } from '@/hooks/dados/useProgresso';
import { useTrilhaIndisponivel } from '@/hooks/useConexao';
import { guardarElementosCompartilhados } from '@/lib/animacao';
import { matizDaTrilha } from '@/lib/matizTrilha';
import { estadoDaLicao, type EstadoLicao } from '@/regras/progresso';
import { NaoEncontrada } from '@/pages/NaoEncontrada';

export const MENSAGEM_BLOQUEIO = 'Conclua a lição anterior para desbloquear';

const ESTADO: Record<EstadoLicao, { texto: string; icone: LucideIcon }> = {
  concluida: { texto: 'Concluída', icone: CircleCheck },
  quiz_pendente: { texto: 'Quiz pendente', icone: CircleDashed },
  disponivel: { texto: 'Disponível', icone: BookOpen },
  bloqueada: { texto: 'Bloqueada', icone: Lock },
};

export function Trilha() {
  const { trilha: slug } = useParams();
  const trilhas = useTrilhas();
  const licoes = useLicoes();
  const progressos = useProgressos();
  const { carregando, mapa } = useProgressoDasTrilhas();
  const trilhaDaRota = trilhas.data?.find((t) => t.slug === slug);
  const semInternet = useTrilhaIndisponivel(trilhaDaRota?.id);

  if (trilhas.isPending || licoes.isPending || progressos.isPending || carregando) {
    return (
      <div className="space-y-3" aria-label="Carregando trilha">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const trilha = trilhas.data?.find((t) => t.slug === slug);
  if (!trilha) return <NaoEncontrada />;
  if (semInternet) return <AvisoSemInternet voltarPara="/trilhas" />;

  const daTrilha = (licoes.data ?? []).filter((l) => l.trilhaId === trilha.id).sort((a, b) => a.ordem - b.ordem);
  const p = mapa.get(trilha.id);
  const concluidas = p?.licoesConcluidas ?? 0;

  const estilo = { '--matiz': matizDaTrilha(trilha.slug) } as CSSProperties;

  return (
    <section className="space-y-5">
      <header data-flip-id={`trilha-${trilha.id}:card`} style={estilo} className="hero-trilha space-y-3 rounded-3xl p-5">
        <span data-flip-id={`trilha-${trilha.id}:icone`} className="icone-hero flex size-12 items-center justify-center rounded-2xl">
          <IconeTrilha slug={trilha.slug} className="size-6" />
        </span>
        <h1 data-flip-id={`trilha-${trilha.id}:titulo`} className="text-2xl font-semibold leading-tight">{trilha.titulo}</h1>
        <p className="text-sm opacity-90">{trilha.descricao}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {p && <SeloStatus status={p.status} />}
          {p && <EtiquetaNivel nivel={p.nivelAtual} prefixo="Nível atual:" />}
        </div>
        <Progress value={(concluidas / 3) * 100} aria-label={`Progresso: ${concluidas} de 3 lições`} className="bg-white/25 [&>div]:bg-destaque" />
        <p className="text-sm tabular-nums opacity-90">{concluidas} de 3 lições concluídas</p>
        <BaixarTrilha trilhaId={trilha.id} />
      </header>

      <ol className="space-y-2">
        {daTrilha.map((licao) => {
          const estado = estadoDaLicao(licao, daTrilha, progressos.data ?? []);
          const { texto, icone: Icone } = ESTADO[estado];
          const conteudo = (
            <>
              <span data-flip-id={`licao-${licao.id}:numero`} className="icone-trilha flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums" style={estilo}>{licao.ordem}</span>
              <span className="flex-1 space-y-0.5">
                <span className="block font-medium">{licao.titulo}</span>
                <span className="block text-sm text-muted-foreground">{licao.tempoLeituraMin} min de leitura</span>
              </span>
              <span className={`inline-flex shrink-0 items-center gap-1 text-sm ${estado === 'concluida' ? 'text-acerto' : 'text-muted-foreground'}`}>
                <Icone aria-hidden="true" className="size-4" />
                {texto}
              </span>
            </>
          );
          const classe = 'flex min-h-16 w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-xs ring-1 ring-foreground/10';
          return (
            <li key={licao.id}>
              {estado === 'bloqueada' ? (
                <button
                  type="button"
                  aria-disabled="true"
                  className={`${classe} cursor-not-allowed opacity-70`}
                  onClick={() => toast(MENSAGEM_BLOQUEIO, { id: 'licao-bloqueada' })}
                >
                  {conteudo}
                </button>
              ) : (
                <Link
                  to={`/trilhas/${trilha.slug}/licoes/${licao.ordem}`}
                  data-flip-id={`licao-${licao.id}:linha`}
                  onClick={() => guardarElementosCompartilhados(`licao-${licao.id}`)}
                  className={`${classe} focus-visible:outline-2 focus-visible:outline-ring`}
                >
                  {conteudo}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
