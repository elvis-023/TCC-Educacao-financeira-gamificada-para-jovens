import { Menu } from 'lucide-react';
import { NavLink, Outlet, useMatches, useNavigate } from 'react-router';
import { marcarSaidaDoAdmin } from '@/app/saidaDoAdmin';
import { AvisoRelogioSimulado } from '@/components/AvisoRelogioSimulado';
import { FerramentasDemonstracao } from '@/components/FerramentasDemonstracao';
import { SeloDados } from '@/components/SeloDados';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MODO_DADOS, repositorios } from '@/dados/repositorios';
import { useFocoNoTitulo } from '@/hooks/useFocoNoTitulo';
import { useSair } from '@/hooks/useSair';
import { useAtualizarSessao } from '@/hooks/useSessao';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const itens = [
  { para: '/admin', rotulo: 'Visão geral', fim: true },
  { para: '/admin/questoes', rotulo: 'Banco de questões', fim: false },
  { para: '/admin/parametros', rotulo: 'Parâmetros', fim: false },
  { para: '/admin/exportar', rotulo: 'Exportar dados', fim: false },
];

function MenuAdmin() {
  const navigate = useNavigate();
  const sair = useSair();
  const atualizarSessao = useAtualizarSessao();

  // Voltar ao app: o administrador usa o jovem de demonstração nesta etapa (PRD 3).
  async function voltarAoApp() {
    marcarSaidaDoAdmin();
    await repositorios.sessao.entrarDemonstracao('jovem');
    await atualizarSessao();
    navigate('/inicio');
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <p className="font-semibold">Educação Financeira Gamificada</p>
      <div className="hidden lg:block"><AvisoRelogioSimulado /></div>
      <nav aria-label="Menu do administrador" className="flex flex-col gap-1">
        {itens.map((item) => (
          <NavLink
            key={item.para}
            to={item.para}
            end={item.fim}
            className={({ isActive }) =>
              cn(
                'flex min-h-11 items-center rounded-md px-3 text-sm',
                isActive ? 'bg-primary/10 font-medium text-primary' : 'text-foreground hover:bg-muted',
              )
            }
          >
            {item.rotulo}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2">
        {MODO_DADOS === 'local' && (
          <Dialog>
            <DialogTrigger asChild><Button variant="outline">Ferramentas de demonstração</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ferramentas de demonstração</DialogTitle>
                <DialogDescription className="sr-only">Atalhos para a apresentação do TCC</DialogDescription>
              </DialogHeader>
              <FerramentasDemonstracao papel="admin" />
            </DialogContent>
          </Dialog>
        )}
        {MODO_DADOS === 'local' && <Button variant="outline" onClick={voltarAoApp}>Voltar ao app</Button>}
        <Button variant="ghost" onClick={sair}>Sair</Button>
      </div>
    </div>
  );
}

export function LayoutAdmin() {
  useFocoNoTitulo();
  const titulo = ((useMatches().at(-1)?.handle ?? {}) as { titulo?: string }).titulo;
  return (
    <div className="min-h-dvh lg:flex">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-background lg:block">
        <MenuAdmin />
      </aside>
      <div className="flex-1 lg:pl-60">
        <header className="flex items-center gap-2 border-b p-2 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Abrir menu">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu do administrador</SheetTitle>
                <SheetDescription>Navegação da área do administrador</SheetDescription>
              </SheetHeader>
              <MenuAdmin />
            </SheetContent>
          </Sheet>
          <span className="font-semibold">Administrador</span>
          <AvisoRelogioSimulado />
        </header>
        <main id="conteudo" className="mx-auto w-full max-w-[1200px] space-y-4 p-4">
          <header className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{titulo}</h1>
            <SeloDados variante="admin" />
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
