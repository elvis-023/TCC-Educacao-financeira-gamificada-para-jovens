import { BookOpen, Calculator, House, Trophy, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRef } from 'react';
import { NavLink, Outlet, useLocation, useMatches } from 'react-router';
import { BannerOffline } from '@/components/BannerOffline';
import { TopoJovem } from '@/components/TopoJovem';
import { useFocoNoTitulo } from '@/hooks/useFocoNoTitulo';
import { useMorph } from '@/hooks/useMorph';
import { useSincronizacao } from '@/hooks/useSincronizacao';
import { useTransicaoDeRota } from '@/hooks/useTransicaoDeRota';
import { useVerificadorDeLembretes } from '@/hooks/useVerificadorDeLembretes';
import { cn } from '@/lib/utils';

const itens: { para: string; rotulo: string; icone: LucideIcon }[] = [
  { para: '/inicio', rotulo: 'Início', icone: House },
  { para: '/trilhas', rotulo: 'Trilhas', icone: BookOpen },
  { para: '/simuladores', rotulo: 'Simuladores', icone: Calculator },
  { para: '/ranking', rotulo: 'Ranking', icone: Trophy },
  { para: '/perfil', rotulo: 'Perfil', icone: User },
];

interface InfoDaRota { titulo?: string; saudacao?: boolean }

export function LayoutJovem() {
  // Cada rota informa o título (ou a saudação) do topo pelo handle do React Router.
  const info = (useMatches().at(-1)?.handle ?? {}) as InfoDaRota;
  const { pathname } = useLocation();
  const barra = useRef<HTMLElement>(null);
  useSincronizacao();
  useFocoNoTitulo();
  useTransicaoDeRota();
  useVerificadorDeLembretes();
  // Morphing: a pílula dourada desliza de uma aba para a outra (GSAP Flip).
  useMorph(barra, [pathname.split('/')[1]], { duracao: 0.5, ease: 'back.out(1.2)' });

  return (
    <div className="min-h-dvh bg-muted/40">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background">
        <div className="sticky top-0 z-20">
          <BannerOffline />
          <TopoJovem titulo={info.titulo} saudacao={info.saudacao} />
        </div>
        <main id="conteudo" className="flex-1 px-4 pb-32 pt-2">
          <Outlet />
        </main>
        <nav
          ref={barra}
          aria-label="Navegação principal"
          className="fixed bottom-3 left-1/2 z-10 flex w-[calc(100%-1.5rem)] max-w-[406px] -translate-x-1/2 items-center justify-between rounded-full bg-hero p-1.5 text-hero-foreground shadow-xl shadow-hero/30 ring-1 ring-white/10"
        >
          {itens.map(({ para, rotulo, icone: Icone }) => (
            <NavLink
              key={para}
              to={para}
              aria-label={rotulo}
              className={({ isActive }) =>
                cn(
                  'relative flex h-12 min-w-12 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque',
                  isActive ? 'text-destaque-foreground' : 'text-hero-foreground/80 hover:text-hero-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span data-flip-id="pilula-nav" aria-hidden="true" className="absolute inset-0 rounded-full bg-destaque" />}
                  <Icone aria-hidden="true" className="relative size-5" />
                  {isActive && <span className="relative">{rotulo}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
