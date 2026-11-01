import { Outlet } from 'react-router';
import { BannerOffline } from '@/components/BannerOffline';
import { useFocoNoTitulo } from '@/hooks/useFocoNoTitulo';

export function LayoutFoco() {
  useFocoNoTitulo();
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px]">
      <BannerOffline />
      <main id="conteudo" className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
