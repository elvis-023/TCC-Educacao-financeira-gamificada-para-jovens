import { BADGES } from '@/dados/demo/badges';
import { LICOES, QUIZZES, TRILHAS } from '@/dados/demo/trilhas';
import type { RepositorioConteudo } from '../contratos';
import { responder } from './comum';

export const conteudoLocal: RepositorioConteudo = {
  listarTrilhas: () => responder(TRILHAS),
  listarLicoes: () => responder(LICOES),
  listarQuizzes: () => responder(QUIZZES),
  listarBadges: () => responder(BADGES),
};
