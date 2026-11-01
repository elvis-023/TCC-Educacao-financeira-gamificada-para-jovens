import { Award, Bell, Info, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Notificacao, TipoNotificacao } from '@/dados/tipos';
import { useMarcarComoLida, useMarcarTodasComoLidas, useNotificacoes } from '@/hooks/dados/useNotificacoes';
import { formatarDataHora } from '@/lib/formatacao';

const ICONE: Record<TipoNotificacao, LucideIcon> = { lembrete: Bell, conquista: Award, sistema: Info };

export function Notificacoes() {
  const { data, isPending, isError } = useNotificacoes();
  const marcar = useMarcarComoLida();
  const marcarTodas = useMarcarTodasComoLidas();
  const navigate = useNavigate();

  if (isPending) return <div className="space-y-2" aria-label="Carregando notificações">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  if (isError || !data) return <p role="alert">Não foi possível carregar as notificações. Tente de novo.</p>;

  const naoLidas = data.filter((n) => !n.lida).length;

  async function abrir(n: Notificacao) {
    try {
      if (!n.lida) await marcar.mutateAsync(n.id);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível marcar como lida');
    }
    if (n.link) navigate(n.link);
  }

  return (
    <section className="space-y-4">
      <h1 className="sr-only">Notificações</h1>
      {data.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Nenhuma notificação por aqui.</p>
      ) : (
        <>
          <Button variant="outline" className="w-full" disabled={naoLidas === 0 || marcarTodas.isPending} onClick={() => marcarTodas.mutate()}>
            Marcar todas como lidas
          </Button>
          <ul className="space-y-2">
            {data.map((n) => {
              const Icone = ICONE[n.tipo];
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => abrir(n)}
                    className={`flex min-h-16 w-full items-start gap-3 rounded-2xl p-3 text-left shadow-xs ring-1 focus-visible:outline-2 focus-visible:outline-ring ${n.lida ? 'bg-card ring-foreground/10' : 'bg-primary/10 ring-primary/40'}`}
                  >
                    <Icone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block">{n.mensagem}</span>
                      <span className="block text-sm text-muted-foreground tabular-nums">{formatarDataHora(n.dataEnvio)}</span>
                    </span>
                    {!n.lida && (
                      <>
                        <span aria-hidden="true" className="mt-2 size-2.5 shrink-0 rounded-full bg-primary" />
                        <span className="sr-only">Nova</span>
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
