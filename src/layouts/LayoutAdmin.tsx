import { Menu } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { marcarSaidaDoAdmin } from '@/app/saidaDoAdmin';
import { Button } from '@/components/ui/button';
import { repositorios } from '@/dados/repositorios';
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
        <Button variant="outline">Ferramentas de demonstração</Button>
        <Button variant="outline" onClick={voltarAoApp}>Voltar ao app</Button>
        <Button variant="ghost" onClick={sair}>Sair</Button>
      </div>
    </div>
  );
}

export function LayoutAdmin() {
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
        </header>
        <main id="conteudo" className="mx-auto w-full max-w-[1200px] p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
