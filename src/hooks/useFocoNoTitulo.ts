import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Acessibilidade (PRD 5.6): ao trocar de tela, o foco vai para o título (h1), para o leitor de tela anunciar a tela nova.
 * A tela pode carregar depois (rotas com lazy, dados), então procura o h1 por até 2 s.
 */
export function useFocoNoTitulo() {
  const { pathname } = useLocation();
  useEffect(() => {
    let tentativas = 0;
    const procurar = window.setInterval(() => {
      const titulo = document.querySelector<HTMLElement>('h1');
      tentativas += 1;
      if (titulo) {
        titulo.tabIndex = -1;
        titulo.focus({ preventScroll: true });
        window.clearInterval(procurar);
      } else if (tentativas >= 20) {
        window.clearInterval(procurar);
      }
    }, 100);
    return () => window.clearInterval(procurar);
  }, [pathname]);
}
