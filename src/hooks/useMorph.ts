import { useLayoutEffect, useRef, type DependencyList, type RefObject } from 'react';
import { Flip, reduzMovimento, type EstadoFlip } from '@/lib/animacao';

/**
 * Layout animation (GSAP Flip): sempre que `dependencias` mudam, os filhos com `data-flip-id` do container
 * vão do lugar antigo para o novo (troca de ordem do ranking, pílula que muda de aba).
 */
export function useMorph(container: RefObject<HTMLElement | null>, dependencias: DependencyList, opcoes: { duracao?: number; ease?: string } = {}) {
  const anterior = useRef<EstadoFlip | null>(null);
  useLayoutEffect(() => {
    const raiz = container.current;
    if (!raiz) return;
    const alvos = raiz.querySelectorAll('[data-flip-id]');
    const guardar = () => { anterior.current = Flip.getState(raiz.querySelectorAll('[data-flip-id]')); };
    if (anterior.current && !reduzMovimento()) {
      Flip.from(anterior.current, { targets: alvos, duration: opcoes.duracao ?? 0.45, ease: opcoes.ease ?? 'power3.inOut', onComplete: guardar });
    } else {
      guardar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as dependências são as informadas por quem chama
  }, dependencias);
}
