import type { gsap as GsapTipo } from 'gsap';
import type { Flip as FlipTipo } from 'gsap/Flip';

type EstadoFlip = ReturnType<typeof FlipTipo.getState>;

// O GSAP é um pedaço separado do app (carrega logo depois da primeira tela, sem bloquear): enquanto não chega, as telas só trocam, sem animação.
let gsapCarregado: typeof GsapTipo | null = null;
let flipCarregado: typeof FlipTipo | null = null;
let carregando: Promise<void> | null = null;

export function carregarAnimacao(): Promise<void> {
  carregando ??= Promise.all([import('gsap'), import('gsap/Flip')]).then(([{ gsap }, { Flip }]) => {
    gsap.registerPlugin(Flip);
    gsapCarregado = gsap;
    flipCarregado = Flip;
  });
  return carregando;
}

export const obterFlip = () => flipCarregado;

/** Respeita "reduzir movimento" do sistema (PRD 5.6): sem isso, a tela só troca. */
export const reduzMovimento = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PROPS = 'borderRadius,opacity,backgroundColor,color';

/**
 * Navegação com elemento compartilhado, container transform e hero (GSAP Flip):
 * antes de navegar, guarda posição e tamanho dos elementos `data-flip-id="<grupo>:..."` da tela de origem;
 * quando a tela de destino mostra elementos com os mesmos ids, eles viajam do lugar antigo para o novo.
 */
let pendente: { estado: EstadoFlip; grupo: string } | null = null;

export function guardarElementosCompartilhados(grupo: string): void {
  pendente = null;
  if (reduzMovimento() || !flipCarregado) return;
  const alvos = document.querySelectorAll(`[data-flip-id^="${grupo}:"]`);
  if (alvos.length > 0) pendente = { estado: flipCarregado.getState(alvos, { props: PROPS }), grupo };
}

/** Devolve true quando algum elemento da tela nova recebeu a animação. */
export function animarElementosCompartilhados(): boolean {
  const guardado = pendente;
  pendente = null;
  if (!guardado || !flipCarregado || reduzMovimento()) return false;
  const alvos = document.querySelectorAll(`[data-flip-id^="${guardado.grupo}:"]`);
  if (alvos.length === 0) return false;
  flipCarregado.from(guardado.estado, {
    targets: alvos,
    duration: 0.6,
    ease: 'expo.inOut',
    absolute: false,
    scale: false,
    nested: true,
    zIndex: 30,
    props: PROPS,
  });
  return true;
}

/** Entrada discreta da tela nova quando não houve elemento compartilhado: um único fade curto. */
export function entradaDaTela(alvo: Element | null): void {
  if (!alvo || !gsapCarregado || reduzMovimento()) return;
  gsapCarregado.fromTo(alvo, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', clearProps: 'opacity,transform' });
}

/** Cada questão nova do quiz entra com as alternativas em sequência. */
export function entradaDasAlternativas(): void {
  if (!gsapCarregado || reduzMovimento()) return;
  gsapCarregado.fromTo('[data-alternativa]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: 'power2.out', clearProps: 'opacity,transform' });
}

export type { EstadoFlip };
