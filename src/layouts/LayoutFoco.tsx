import { Outlet } from 'react-router';
import { BannerOffline } from '@/components/BannerOffline';
import { useFocoNoTitulo } from '@/hooks/useFocoNoTitulo';
import { useTransicaoDeRota } from '@/hooks/useTransicaoDeRota';

export function LayoutFoco() {
  useFocoNoTitulo();
  useTransicaoDeRota();
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px]">
      <BannerOffline />
      <main id="conteudo" className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
