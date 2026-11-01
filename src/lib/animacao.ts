import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

export { gsap, Flip };

type EstadoFlip = ReturnType<typeof Flip.getState>;

/** Respeita "reduzir movimento" do sistema (PRD 5.6): sem isso, a tela só troca. */
export const reduzMovimento = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Navegação com elemento compartilhado, container transform e hero (GSAP Flip):
 * antes de navegar, guarda posição e tamanho dos elementos `data-flip-id="<grupo>:..."` da tela de origem;
 * quando a tela de destino mostra elementos com os mesmos ids, eles viajam do lugar antigo para o novo.
 */
let pendente: { estado: EstadoFlip; grupo: string } | null = null;

export function guardarElementosCompartilhados(grupo: string): void {
  pendente = null;
  if (reduzMovimento()) return;
  const alvos = document.querySelectorAll(`[data-flip-id^="${grupo}:"]`);
  if (alvos.length > 0) pendente = { estado: Flip.getState(alvos, { props: 'borderRadius,opacity,backgroundColor,color' }), grupo };
}

/** Devolve true quando algum elemento da tela nova recebeu a animação. */
export function animarElementosCompartilhados(): boolean {
  const guardado = pendente;
  pendente = null;
  if (!guardado || reduzMovimento()) return false;
  const alvos = document.querySelectorAll(`[data-flip-id^="${guardado.grupo}:"]`);
  if (alvos.length === 0) return false;
  Flip.from(guardado.estado, {
    targets: alvos,
    duration: 0.6,
    ease: 'expo.inOut',
    absolute: false,
    scale: false,
    nested: true,
    zIndex: 30,
    props: 'borderRadius,opacity,backgroundColor,color',
  });
  return true;
}

/** Entrada discreta da tela nova quando não houve elemento compartilhado: um único fade curto. */
export function entradaDaTela(alvo: Element | null): void {
  if (!alvo || reduzMovimento()) return;
  gsap.fromTo(alvo, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', clearProps: 'opacity,transform' });
}

export type { EstadoFlip };
