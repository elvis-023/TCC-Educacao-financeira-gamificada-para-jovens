import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { assinarAparelho } from '@/dados/aparelho';
import { repositorios } from '@/dados/repositorios';
import { chaves } from '@/hooks/dados/chaves';

/** RF09 e RN04: verifica o lembrete ao abrir, ao voltar para a aba, a cada minuto e quando o relógio simulado muda. */
export function useVerificadorDeLembretes() {
  const navigate = useNavigate();
  const cliente = useQueryClient();

  useEffect(() => {
    let ativo = true;
    let verificando = false;
    async function verificar() {
      if (verificando) return;
      verificando = true;
      try {
        const nova = await repositorios.notificacoes.verificarLembrete();
        if (!ativo || !nova) return;
        await cliente.invalidateQueries({ queryKey: chaves.notificacoes });
        toast(nova.mensagem, { action: nova.link ? { label: 'Continuar', onClick: () => navigate(nova.link!) } : undefined });
      } catch {
        // sem conexão ou sem sessão: tenta de novo na próxima verificação
      } finally {
        verificando = false;
      }
    }
    const aoVoltar = () => { if (document.visibilityState === 'visible') void verificar(); };
    void verificar();
    document.addEventListener('visibilitychange', aoVoltar);
    const intervalo = window.setInterval(() => void verificar(), 60_000);
    const desassinar = assinarAparelho(() => void verificar());
    return () => {
      ativo = false;
      document.removeEventListener('visibilitychange', aoVoltar);
      window.clearInterval(intervalo);
      desassinar();
    };
  }, [cliente, navigate]);
}
