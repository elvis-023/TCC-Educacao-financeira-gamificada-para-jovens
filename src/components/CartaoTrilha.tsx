import { CircleCheck } from 'lucide-react';
import type { CSSProperties } from 'react';
import { EtiquetaNivel } from '@/components/EtiquetaNivel';
import { IconeTrilha } from '@/components/IconeTrilha';
import { LinkTrilha } from '@/components/LinkTrilha';
import { SeloStatus } from '@/components/SeloStatus';
import { Progress } from '@/components/ui/progress';
import type { ProgressoTrilha, Trilha } from '@/dados/tipos';
import { matizDaTrilha } from '@/lib/matizTrilha';

interface Props { trilha: Trilha; progresso?: ProgressoTrilha; baixada?: boolean; detalhado?: boolean }

/** Cartão de trilha. Ícone, título e o próprio cartão são elementos compartilhados com o cabeçalho da trilha (GSAP Flip). */
export function CartaoTrilha({ trilha, progresso, baixada, detalhado }: Props) {
  const concluidas = progresso?.licoesConcluidas ?? 0;
  const estilo = { '--matiz': matizDaTrilha(trilha.slug) } as CSSProperties;
  return (
    <LinkTrilha trilhaId={trilha.id} slug={trilha.slug} className="block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <div data-flip-id={`trilha-${trilha.id}:card`} style={estilo} className="cartao-trilha flex h-full flex-col gap-3 rounded-3xl p-4">
        <span data-flip-id={`trilha-${trilha.id}:icone`} className="icone-trilha flex size-11 items-center justify-center rounded-2xl">
          <IconeTrilha slug={trilha.slug} className="size-5" />
        </span>
        <h2 data-flip-id={`trilha-${trilha.id}:titulo`} className="font-heading text-base font-semibold leading-snug">{trilha.titulo}</h2>
        {detalhado && <p className="line-clamp-2 text-sm text-muted-foreground">{trilha.descricao}</p>}
        <div className="mt-auto space-y-2">
          <Progress value={(concluidas / 3) * 100} aria-label={`Progresso: ${concluidas} de 3 lições`} />
          <div className="space-y-0.5 text-sm">
            <p className="tabular-nums text-muted-foreground">{concluidas} de 3 lições</p>
            {progresso && <SeloStatus status={progresso.status} />}
          </div>
          {detalhado && progresso && progresso.status !== 'nao_iniciada' && <EtiquetaNivel nivel={progresso.nivelAtual} prefixo="Nível:" />}
          {baixada && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CircleCheck aria-hidden="true" className="size-3.5" />
              Disponível offline
            </span>
          )}
        </div>
      </div>
    </LinkTrilha>
  );
}
