import { Outlet } from 'react-router';

export function LayoutFoco() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] p-4">
      <Outlet />
    </div>
  );
}
