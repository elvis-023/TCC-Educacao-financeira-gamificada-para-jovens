export type Papel = 'jovem' | 'admin';
export type Nivel = 'facil' | 'medio' | 'dificil';
export type TipoTeste = 'pre' | 'pos';
export type FormaTeste = 'A' | 'B';
export type TipoNotificacao = 'lembrete' | 'conquista' | 'sistema';
export type StatusTrilha = 'nao_iniciada' | 'em_andamento' | 'concluida';
export type CodigoBadge = 'primeiro_quiz' | 'primeira_trilha' | 'sequencia_7_dias' | 'gabaritou' | 'desafio_aceito' | 'mestre_das_financas';
export type ChaveParametro = 'limite_inatividade_horas' | 'janela_motor' | 'limiar_subida' | 'limiar_descida';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  xpTotal: number;
  diasStreak: number;
  ultimoDiaUso: string | null; // AAAA-MM-DD no fuso de São Paulo
  ultimaAtividadeEm: string | null; // ISO da última lição ou quiz concluído
  receberLembretes: boolean;
  tcleVersao: string | null;
  tcleAceitoEm: string | null;
  privacidadeAceitaEm: string | null;
  maioridadeDeclaradaEm: string | null;
  criadoEm: string;
  xpSemanaFicticio?: number; // só nos 11 jovens fictícios do ranking (PRD 6.3)
}
export type Administrador = Usuario & { papel: 'admin' };
export interface Sessao { usuarioId: string; papel: Papel; nome: string }

export interface Trilha { id: string; slug: string; titulo: string; descricao: string; categoria: string; ordem: number }
export type BlocoConteudo =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'exemplo'; titulo: string; linhas: string[] }
  | { tipo: 'resumo'; itens: string[] };
export interface Licao { id: string; trilhaId: string; ordem: 1 | 2 | 3; titulo: string; tempoLeituraMin: number; conteudo: BlocoConteudo[] }
export interface Quiz { id: string; licaoId: string; tipoAvaliacao: 'adaptativo'; numeroQuestoes: number }

export interface Questao {
  id: string;
  quizId: string;
  enunciado: string;
  alternativas: [string, string, string, string];
  respostaCorreta: 0 | 1 | 2 | 3;
  nivelDificuldade: Nivel;
  explicacao: string;
  ativa: boolean;
  criadoEm: string;
  atualizadoEm: string;
}
/** O que o quiz mostra antes da resposta: sem a correta e sem a explicação. */
export interface QuestaoPublica {
  id: string;
  enunciado: string;
  alternativas: string[];
  nivelDificuldade: Nivel;
  licaoOrdem: number;
  numeroNoQuiz: number;
  totalNoQuiz: number;
}
export interface QuestaoAdmin extends Questao { trilhaId: string; licaoId: string; licaoOrdem: number }
export interface QuestaoEditavel {
  id: string | null;
  quizId: string;
  enunciado: string;
  alternativas: [string, string, string, string];
  respostaCorreta: 0 | 1 | 2 | 3;
  nivelDificuldade: Nivel;
  explicacao: string;
  ativa: boolean;
}

export interface RespostaQuiz {
  id: string;
  usuarioId: string;
  quizId: string;
  questaoId: string;
  trilhaId: string;
  nivelQuestao: Nivel;
  alternativaMarcada: number;
  acertou: boolean;
  xpGanho: number;
  nivelTrilhaApos: Nivel;
  respondidaEm: string;
}
export interface ResultadoResposta {
  acertou: boolean;
  respostaCorreta: number;
  explicacao: string;
  xpGanho: number;
  nivelAntes: Nivel;
  nivelDepois: Nivel;
  quizConcluido: boolean;
  acertosNoQuiz: number;
  xpNoQuiz: number;
  trilhaConcluida: boolean;
  conquistasNovas: CodigoBadge[];
}
/** Modo Treino: resposta guardada à parte das respostas do quiz, para não mexer no nível adaptativo nem na pesquisa. */
export interface RespostaTreino { id: string; usuarioId: string; questaoId: string; acertou: boolean; xpGanho: number; respondidaEm: string }
export interface QuestaoTreino { id: string; enunciado: string; alternativas: string[]; nivelDificuldade: Nivel }
export interface ResultadoTreino { acertou: boolean; respostaCorreta: number; explicacao: string; xpGanho: number; xpHoje: number }
export interface EstadoTreino { questoesDisponiveis: number; xpHoje: number }
export interface Progresso {
  id: string;
  usuarioId: string;
  trilhaId: string;
  licaoId: string;
  leituraConcluidaEm: string | null;
  quizConcluidoEm: string | null;
  acertos: number;
  xpGanho: number;
  sincronizadoOffline: boolean;
}
export interface ProgressoTrilha {
  trilhaId: string;
  licoesConcluidas: number;
  status: StatusTrilha;
  nivelAtual: Nivel;
  taxaAcertos: number | null;
  dataUltimoAcesso: string | null;
}

export type UnidadeTaxa = 'mes' | 'ano';
export type UnidadePrazo = 'meses' | 'anos';
export interface EntradaJuros { valorInicial: number; aporteMensal: number; taxaPercentual: number; unidadeTaxa: UnidadeTaxa; prazo: number; unidadePrazo: UnidadePrazo }
export interface EntradaFatura { valorFatura: number; pagamentoMinimo: number; taxaRotativoPercentual: number; taxaParcelamentoPercentual: number; parcelas: number }
export type Simulacao =
  | { id: string; usuarioId: string; tipoSimulacao: 'juros_compostos'; parametros: EntradaJuros; resultadoFinal: number; criadaEm: string }
  | { id: string; usuarioId: string; tipoSimulacao: 'cartao_credito'; parametros: EntradaFatura; resultadoFinal: number; criadaEm: string };

export interface Badge { id: CodigoBadge; nome: string; criterioMarco: string; icone: string; ordem: number }
export interface UsuarioBadge { usuarioId: string; badgeId: CodigoBadge; conquistadoEm: string }
export interface Notificacao { id: string; usuarioId: string; tipo: TipoNotificacao; mensagem: string; link: string | null; dataEnvio: string; lida: boolean }

export interface TesteDiagnostico {
  id: string;
  pseudonimo: string;
  tipoTeste: TipoTeste;
  forma: FormaTeste;
  versao: string;
  iniciadoEm: string;
  concluidoEm: string | null;
  pontuacaoTotal: number | null;
}
export interface PerguntaDiagnostica { id: string; forma: FormaTeste; versao: string; numero: 1 | 2 | 3; enunciado: string; alternativas: string[]; alternativaCorreta: number }
export type PerguntaPublica = Pick<PerguntaDiagnostica, 'id' | 'numero' | 'enunciado' | 'alternativas'>;
export interface RespostaTeste { id: string; testeId: string; perguntaId: string; alternativaMarcada: number; acertou: boolean; respondidaEm: string }
export interface ResumoTeste {
  tipoTeste: TipoTeste;
  forma: FormaTeste;
  versao: string;
  iniciadoEm: string;
  concluidoEm: string | null;
  pontuacaoTotal: number | null;
  respondidas: number;
}

export interface ParametroSistema { id: string; chave: ChaveParametro; valor: number; alteradoPor: string | null; alteradoEm: string }
export interface LinhaHistoricoParametro { chave: ChaveParametro; valorAnterior: number | null; valor: number; autor: string; alteradoEm: string }

export interface LinhaRanking { posicao: number; nomeExibicao: string; xp: number; ehVoce: boolean }

export interface MetricasPesquisa {
  participantes: number;
  preConcluidos: number;
  posConcluidos: number;
  nPares: number;
  ganhoMedio: number | null; // pontos percentuais, só de quem fez os dois testes
  porPergunta: { numero: number; pre: number; pos: number }[]; // % de acerto, só pares
  participantesTabela: { pseudonimo: string; preData: string | null; preNota: number | null; posData: string | null; posNota: number | null }[];
}
export interface LinhaExportacao {
  idPseudonimizado: string;
  tipoTeste: TipoTeste;
  forma: FormaTeste;
  versao: string;
  data: string; // dd/mm/aaaa
  pergunta: number;
  respostaMarcada: string;
  acerto: 0 | 1;
  notaTotal: number;
}
