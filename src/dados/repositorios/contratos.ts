import type { Badge, Licao, Papel, Progresso, Quiz, RespostaQuiz, ResumoTeste, Sessao, Simulacao, Trilha } from '@/dados/tipos';

export interface DadosCadastro { nome: string; email: string; senha: string; tcleVersao: string }

export interface RepositorioSessao {
  sessaoAtual(): Promise<Sessao | null>;
  observar(aoMudar: () => void): () => void;
  cadastrar(dados: DadosCadastro): Promise<void>;
  entrar(email: string, senha: string): Promise<void>;
  entrarDemonstracao(papel: Papel): Promise<void>; // só no modo local
  sair(): Promise<void>;
  pedirNovaSenha(email: string): Promise<void>;
  definirNovaSenha(senha: string): Promise<void>; // só no modo Supabase
}
export interface RepositorioConteudo {
  listarTrilhas(): Promise<Trilha[]>;
  listarLicoes(): Promise<Licao[]>;
  listarQuizzes(): Promise<Quiz[]>;
  listarBadges(): Promise<Badge[]>;
}
export interface RepositorioProgresso {
  meusProgressos(): Promise<Progresso[]>;
  minhasRespostas(): Promise<RespostaQuiz[]>;
  concluirLeitura(licaoId: string): Promise<void>;
}
export interface RepositorioTestes {
  meusTestes(): Promise<ResumoTeste[]>;
}
export interface RepositorioSimulacoes {
  minhasSimulacoes(): Promise<Simulacao[]>;
  salvar(simulacao: Pick<Simulacao, 'tipoSimulacao' | 'parametros' | 'resultadoFinal'>): Promise<void>;
}

export interface Repositorios {
  sessao: RepositorioSessao;
  conteudo: RepositorioConteudo;
  progresso: RepositorioProgresso;
  testes: RepositorioTestes;
  simulacoes: RepositorioSimulacoes;
}
