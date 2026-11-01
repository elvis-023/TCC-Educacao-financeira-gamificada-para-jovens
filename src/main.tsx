import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router/dom';
import './index.css';
import { toast } from 'sonner';
import { clienteConsultas } from '@/app/consultas';
import { armazenamentoOk, carregarBanco } from '@/dados/bancoLocal';
import { roteador } from '@/app/rotas';
import { Notificador } from '@/components/Notificador';
import { ProvedorSessao } from '@/hooks/ProvedorSessao';
import { carregarAnimacao } from '@/lib/animacao';
import { aplicarTema, lerTema } from '@/lib/tema';

aplicarTema(lerTema());
// As animações (GSAP) carregam depois da primeira tela, sem bloquear.
void carregarAnimacao();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={clienteConsultas}>
      <ProvedorSessao>
        <RouterProvider router={roteador} />
      </ProvedorSessao>
      <Notificador />
    </QueryClientProvider>
  </StrictMode>,
);

carregarBanco();
if (!armazenamentoOk()) {
  setTimeout(() => toast.warning('Seu progresso não será salvo neste navegador.'), 0);
}
