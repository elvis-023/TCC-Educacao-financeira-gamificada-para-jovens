import type {
  Badge, ChaveParametro, EstadoTreino, LinhaExportacao, LinhaHistoricoParametro, LinhaRanking, Licao, MetricasPesquisa, Notificacao, Papel, PerguntaPublica, Progresso, QuestaoAdmin, QuestaoEditavel, QuestaoPublica, QuestaoTreino, Quiz, RespostaQuiz, ResultadoResposta, ResultadoTreino, ResumoTeste, Sessao, Simulacao, TipoTeste, Trilha, Usuario, UsuarioBadge,
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
  sincronizarPendentes(): Promise<number>;
}
export interface RepositorioQuiz {
  proximaQuestao(quizId: string): Promise<QuestaoPublica | null>;
  responder(quizId: string, questaoId: string, alternativa: number): Promise<ResultadoResposta>;
}
export interface RepositorioNotificacoes {
  minhasNotificacoes(): Promise<Notificacao[]>;
  marcarComoLida(id: string): Promise<void>;
  marcarTodasComoLidas(): Promise<void>;
  /** Gera o lembrete de inatividade (RF09, RN04) quando for o caso; devolve a notificação nova ou null. */
  verificarLembrete(): Promise<Notificacao | null>;
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

export interface RepositorioConquistas {
  minhasConquistas(): Promise<UsuarioBadge[]>;
}
export type PeriodoRanking = 'geral' | 'semana';
export interface RepositorioRanking {
  ranking(periodo: PeriodoRanking): Promise<LinhaRanking[]>;
}

/** Área do administrador (RF10, RF11, RF12): cada método recusa quem não for administrador. */
export interface RepositorioAdmin {
  metricasPesquisa(): Promise<MetricasPesquisa>;
  exportarRespostas(): Promise<LinhaExportacao[]>;
  listarQuestoes(): Promise<QuestaoAdmin[]>;
  salvarQuestao(questao: QuestaoEditavel): Promise<string>;
  parametrosAtuais(): Promise<Record<ChaveParametro, number>>;
  historicoParametros(): Promise<LinhaHistoricoParametro[]>;
  salvarParametros(valores: Record<ChaveParametro, number>): Promise<void>;
}

/** Modo Treino: questões das lições cujo quiz já foi concluído, repetíveis, com XP reduzido e teto por dia. */
export interface RepositorioTreino {
  estado(): Promise<EstadoTreino>;
  proximaQuestao(jaVistas: string[]): Promise<QuestaoTreino | null>;
  responder(questaoId: string, alternativa: number): Promise<ResultadoTreino>;
}

export interface RepositorioDemonstracao {
  disponivel: boolean; // false com a base de dados real
  limiteDeInatividade(): Promise<number>;
  avancarRelogio(horas: number): Promise<void>;
  liberarPosTeste(): Promise<void>;
  reiniciar(): Promise<void>;
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
  conquistas: RepositorioConquistas;
  ranking: RepositorioRanking;
  demonstracao: RepositorioDemonstracao;
  admin: RepositorioAdmin;
  treino: RepositorioTreino;
}
