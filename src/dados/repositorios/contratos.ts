import type { Badge, Licao, Quiz, Simulacao, Trilha } from '@/dados/tipos';

export interface RepositorioConteudo {
  listarTrilhas(): Promise<Trilha[]>;
  listarLicoes(): Promise<Licao[]>;
  listarQuizzes(): Promise<Quiz[]>;
  listarBadges(): Promise<Badge[]>;
}
export interface RepositorioSimulacoes {
  minhasSimulacoes(): Promise<Simulacao[]>;
  salvar(simulacao: Pick<Simulacao, 'tipoSimulacao' | 'parametros' | 'resultadoFinal'>): Promise<void>;
}

export interface Repositorios {
  conteudo: RepositorioConteudo;
  simulacoes: RepositorioSimulacoes;
}
