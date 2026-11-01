import { Toaster } from 'sonner';
import { lerTema } from '@/lib/tema';

export function Notificador() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      theme={lerTema() === 'escuro' ? 'dark' : 'light'}
    />
  );
}
