import { carregarBanco } from '@/dados/bancoLocal';
import type { RepositorioConquistas } from '../contratos';
import { responder, usuarioDaSessao } from './comum';

export const conquistasLocal: RepositorioConquistas = {
  minhasConquistas: () => responder(carregarBanco().usuarioBadges.filter((b) => b.usuarioId === usuarioDaSessao())),
};
