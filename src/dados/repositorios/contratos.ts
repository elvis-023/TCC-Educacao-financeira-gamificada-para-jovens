import type { Badge, Licao, Quiz, Trilha } from '@/dados/tipos';

export interface RepositorioConteudo {
  listarTrilhas(): Promise<Trilha[]>;
  listarLicoes(): Promise<Licao[]>;
  listarQuizzes(): Promise<Quiz[]>;
  listarBadges(): Promise<Badge[]>;
}

export interface Repositorios {
  conteudo: RepositorioConteudo;
}
