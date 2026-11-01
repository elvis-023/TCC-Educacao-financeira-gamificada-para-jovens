import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router/dom';
import '@fontsource-variable/inter';
import './index.css';
import { clienteConsultas } from '@/app/consultas';
import { roteador } from '@/app/rotas';
import { Notificador } from '@/components/Notificador';
import { aplicarTema, lerTema } from '@/lib/tema';

aplicarTema(lerTema());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={clienteConsultas}>
      <RouterProvider router={roteador} />
      <Notificador />
    </QueryClientProvider>
  </StrictMode>,
);
