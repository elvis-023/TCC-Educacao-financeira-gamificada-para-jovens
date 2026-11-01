import type {
  Badge, Licao, Notificacao, Papel, PerguntaPublica, Progresso, QuestaoPublica, Quiz, RespostaQuiz, ResultadoResposta, ResumoTeste, Sessao, Simulacao, TipoTeste, Trilha, Usuario,
} from '@/dados/tipos';

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
export interface RepositorioUsuario {
  meuUsuario(): Promise<Usuario>;
  definirReceberLembretes(valor: boolean): Promise<void>;
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
export interface RepositorioQuiz {
  proximaQuestao(quizId: string): Promise<QuestaoPublica | null>;
  responder(quizId: string, questaoId: string, alternativa: number): Promise<ResultadoResposta>;
}
export interface RepositorioNotificacoes {
  minhasNotificacoes(): Promise<Notificacao[]>;
}
export interface RepositorioTestes {
  meusTestes(): Promise<ResumoTeste[]>;
  iniciar(tipo: TipoTeste): Promise<{ resumo: ResumoTeste; perguntas: PerguntaPublica[]; respondidas: string[] }>;
  responder(tipo: TipoTeste, perguntaId: string, alternativa: number): Promise<{ concluido: boolean }>;
}
export interface RepositorioSimulacoes {
  minhasSimulacoes(): Promise<Simulacao[]>;
  salvar(simulacao: Pick<Simulacao, 'tipoSimulacao' | 'parametros' | 'resultadoFinal'>): Promise<void>;
}

export interface Repositorios {
  sessao: RepositorioSessao;
  usuario: RepositorioUsuario;
  conteudo: RepositorioConteudo;
  progresso: RepositorioProgresso;
  quiz: RepositorioQuiz;
  testes: RepositorioTestes;
  notificacoes: RepositorioNotificacoes;
  simulacoes: RepositorioSimulacoes;
}
