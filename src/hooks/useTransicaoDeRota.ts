import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router';
import { animarElementosCompartilhados, entradaDaTela } from '@/lib/animacao';

/** Roda a animação da tela nova: elementos compartilhados (Flip) ou, sem eles, uma entrada curta. */
export function useTransicaoDeRota() {
  const { key } = useLocation();
  useLayoutEffect(() => {
    const animou = animarElementosCompartilhados();
    if (!animou) entradaDaTela(document.getElementById('conteudo'));
  }, [key]);
}
