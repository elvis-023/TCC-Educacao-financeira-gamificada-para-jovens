import { useEffect, useState } from 'react';
import { assinarAparelho } from '@/dados/aparelho';
import { agora } from '@/lib/relogio';

/** O instante atual do app (com o relógio simulado). Redesenha a tela quando o relógio muda e a cada minuto. */
export function useAgora(): Date {
  const [instante, setInstante] = useState(agora);
  useEffect(() => {
    const atualizar = () => setInstante(agora());
    const id = window.setInterval(atualizar, 60_000);
    const desassinar = assinarAparelho(atualizar);
    return () => {
      window.clearInterval(id);
      desassinar();
    };
  }, []);
  return instante;
}
