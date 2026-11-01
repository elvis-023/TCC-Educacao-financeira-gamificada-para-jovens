import { BookOpen, Calculator, House, Trophy, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { cn } from '@/lib/utils';

const itens: { para: string; rotulo: string; icone: LucideIcon }[] = [
  { para: '/inicio', rotulo: 'Início', icone: House },
  { para: '/trilhas', rotulo: 'Trilhas', icone: BookOpen },
  { para: '/simuladores', rotulo: 'Simuladores', icone: Calculator },
  { para: '/ranking', rotulo: 'Ranking', icone: Trophy },
  { para: '/perfil', rotulo: 'Perfil', icone: User },
];

export function LayoutJovem() {
  return (
    <div className="min-h-dvh bg-muted/40">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background">
        <main id="conteudo" className="flex-1 px-4 pb-24 pt-4">
          <Outlet />
        </main>
        <nav
          aria-label="Navegação principal"
          className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-[430px] -translate-x-1/2 border-t bg-background"
        >
          {itens.map(({ para, rotulo, icone: Icone }) => (
            <NavLink
              key={para}
              to={para}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs',
                  isActive ? 'font-medium text-primary' : 'text-muted-foreground',
                )
              }
            >
              <Icone aria-hidden="true" className="size-5" />
              {rotulo}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
