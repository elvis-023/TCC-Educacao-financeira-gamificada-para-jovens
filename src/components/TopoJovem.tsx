import { Bell, Flame, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { AvisoRelogioSimulado } from '@/components/AvisoRelogioSimulado';
import { useNaoLidas } from '@/hooks/dados/useNotificacoes';
import { useMeuUsuario } from '@/hooks/dados/useUsuario';
import { useAgora } from '@/hooks/useRelogio';
import { formatarXp } from '@/lib/formatacao';
import { diaNoFuso } from '@/lib/fuso';
import { sequenciaAtual } from '@/regras/sequencia';

interface Props { titulo?: string; saudacao?: boolean }

/** Topo fixo da área do jovem (PRD 2.3): saudação ou título, XP, sequência e sino. */
export function TopoJovem({ titulo, saudacao }: Props) {
  const { data: usuario } = useMeuUsuario();
  const naoLidas = useNaoLidas();
  const agora = useAgora();

  const xp = usuario?.xpTotal ?? 0;
  const sequencia = usuario ? sequenciaAtual(usuario.diasStreak, usuario.ultimoDiaUso, diaNoFuso(agora)) : 0;
  const primeiroNome = usuario?.nome.split(' ')[0];
  const rotuloSino = naoLidas === 0 ? 'Notificações, nenhuma não lida' : `Notificações, ${naoLidas} ${naoLidas === 1 ? 'não lida' : 'não lidas'}`;

  return (
    <header className="flex min-h-16 items-center justify-between gap-2 bg-background/90 px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0">
          {saudacao ? (
            <p className="truncate font-heading text-lg font-semibold leading-tight">{primeiroNome ? `Olá, ${primeiroNome}!` : 'Olá!'}</p>
          ) : (
            <p className="truncate font-heading font-semibold">{titulo}</p>
          )}
        </div>
        <AvisoRelogioSimulado />
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="inline-flex h-9 items-center gap-1 rounded-full bg-destaque px-3 font-heading text-sm font-semibold text-destaque-foreground tabular-nums" aria-label={`${xp} XP no total`}>
          <Sparkles aria-hidden="true" className="size-4" />
          <span aria-hidden="true">{formatarXp(xp)}</span>
        </span>
        <span
          className="inline-flex h-9 items-center gap-0.5 rounded-full bg-card px-2.5 font-heading text-sm font-semibold text-sequencia ring-1 ring-foreground/10 tabular-nums"
          aria-label={`Sequência de ${sequencia} ${sequencia === 1 ? 'dia' : 'dias'}`}
        >
          <Flame aria-hidden="true" className="size-4 text-sequencia-icone" />
          <span aria-hidden="true">{sequencia}</span>
        </span>
        <Link to="/notificacoes" aria-label={rotuloSino} className="relative flex size-11 items-center justify-center rounded-full hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring">
          <Bell aria-hidden="true" className="size-5" />
          {naoLidas > 0 && (
            <span aria-hidden="true" className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground tabular-nums">
              {naoLidas}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
