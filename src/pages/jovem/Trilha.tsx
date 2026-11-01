import { BookOpen, CircleCheck, CircleDashed, Lock, type LucideIcon } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';
import { AvisoSemInternet } from '@/components/AvisoSemInternet';
import { BaixarTrilha } from '@/components/BaixarTrilha';
import { EtiquetaNivel } from '@/components/EtiquetaNivel';
import { SeloStatus } from '@/components/SeloStatus';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useLicoes, useTrilhas } from '@/hooks/dados/useConteudo';
import { useProgressoDasTrilhas, useProgressos } from '@/hooks/dados/useProgresso';
import { useTrilhaIndisponivel } from '@/hooks/useConexao';
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

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{trilha.titulo}</h1>
        <p className="text-muted-foreground">{trilha.descricao}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {p && <SeloStatus status={p.status} />}
          {p && <EtiquetaNivel nivel={p.nivelAtual} prefixo="Nível atual:" />}
        </div>
        <Progress value={(concluidas / 3) * 100} aria-label={`Progresso: ${concluidas} de 3 lições`} />
        <p className="text-sm text-muted-foreground tabular-nums">{concluidas} de 3 lições concluídas</p>
        <BaixarTrilha trilhaId={trilha.id} />
      </header>

      <ol className="space-y-2">
        {daTrilha.map((licao) => {
          const estado = estadoDaLicao(licao, daTrilha, progressos.data ?? []);
          const { texto, icone: Icone } = ESTADO[estado];
          const conteudo = (
            <>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium tabular-nums">{licao.ordem}</span>
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
          const classe = 'flex min-h-16 w-full items-center gap-3 rounded-xl border p-3 text-left';
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
                <Link to={`/trilhas/${trilha.slug}/licoes/${licao.ordem}`} className={`${classe} hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring`}>
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
