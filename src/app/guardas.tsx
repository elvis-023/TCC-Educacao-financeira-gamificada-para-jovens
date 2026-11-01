import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { toast } from 'sonner';
import { consumirSaidaDoAdmin } from '@/app/saidaDoAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { usePreTesteConcluido } from '@/hooks/dados/useTestes';
import { useSessao } from '@/hooks/useSessao';

function Carregando() {
  return <div className="mx-auto max-w-[430px] space-y-3 p-4"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-32" /></div>;
}

/** Regra 2 (PRD 4.4): com sessão, as telas públicas levam à área do papel. */
export function RotaVisitante() {
  const { sessao, carregando } = useSessao();
  const local = useLocation();
  if (carregando) return <Carregando />;
  if (sessao) {
    // Volta para a rota que a pessoa tentou abrir antes do login (PRD T03), se ela for da área do papel.
    const de = (local.state as { de?: string } | null)?.de;
    const destino = sessao.papel === 'admin'
      ? (de?.startsWith('/admin') ? de : '/admin')
      : (de && !de.startsWith('/admin') ? de : '/inicio');
    return <Navigate to={destino} replace />;
  }
  return <Outlet />;
}

/** Regras 1, 3 e 5 (PRD 4.4). */
export function RotaJovem() {
  const { sessao, carregando } = useSessao();
  const local = useLocation();
  const preTeste = usePreTesteConcluido(Boolean(sessao && sessao.papel === 'jovem'));
  if (carregando) return <Carregando />;
  if (!sessao) return <Navigate to="/entrar" state={{ de: local.pathname }} replace />;
  if (sessao.papel === 'admin') return <Navigate to="/admin" replace />;
  if (preTeste.carregando) return <Carregando />;
  // Regra 3: com o pré-teste pendente, toda a área do jovem leva a ele.
  if (!preTeste.concluido && local.pathname !== '/pre-teste') return <Navigate to="/pre-teste" replace />;
  return <Outlet />;
}

/** Regras 1 e 4 (PRD 4.4). */
export function RotaAdmin() {
  const { sessao, carregando } = useSessao();
  const local = useLocation();
  const negado = Boolean(sessao && sessao.papel !== 'admin');
  useEffect(() => {
    if (negado && !consumirSaidaDoAdmin()) toast.error('Área restrita ao administrador');
  }, [negado]);
  if (carregando) return <Carregando />;
  if (!sessao) return <Navigate to="/entrar" state={{ de: local.pathname }} replace />;
  if (negado) return <Navigate to="/inicio" replace />;
  return <Outlet />;
}
