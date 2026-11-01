import { Outlet } from 'react-router';
import { useFocoNoTitulo } from '@/hooks/useFocoNoTitulo';

export function LayoutPublico() {
  useFocoNoTitulo();
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] p-4">
      <Outlet />
    </div>
  );
}
