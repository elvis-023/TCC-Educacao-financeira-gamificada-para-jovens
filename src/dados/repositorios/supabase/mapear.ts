import type { BlocoConteudo, Licao, Notificacao, Progresso, RespostaQuiz, ResumoTeste, Simulacao, Usuario } from '@/dados/tipos';
import { iso } from './comum';

/* eslint-disable @typescript-eslint/no-explicit-any -- linhas cruas do PostgREST; o tipo final é o do app */
export const paraUsuario = (l: any, email: string): Usuario => ({
  id: l.id, nome: l.nome, email, papel: l.papel, xpTotal: l.xp_total, diasStreak: l.dias_streak, ultimoDiaUso: l.ultimo_dia_uso,
  ultimaAtividadeEm: iso(l.ultima_atividade_em), receberLembretes: l.receber_lembretes, tcleVersao: l.tcle_versao,
  tcleAceitoEm: iso(l.tcle_aceito_em), privacidadeAceitaEm: iso(l.privacidade_aceita_em),
  maioridadeDeclaradaEm: iso(l.maioridade_declarada_em), criadoEm: iso(l.criado_em)!,
});
export const paraLicao = (l: any): Licao => ({
  id: l.id, trilhaId: l.trilha_id, ordem: l.ordem, titulo: l.titulo, tempoLeituraMin: l.tempo_leitura_min, conteudo: l.conteudo as BlocoConteudo[],
});
export const paraProgresso = (l: any): Progresso => ({
  id: String(l.id), usuarioId: l.usuario_id, trilhaId: l.trilha_id, licaoId: l.licao_id, leituraConcluidaEm: iso(l.leitura_concluida_em),
  quizConcluidoEm: iso(l.quiz_concluido_em), acertos: l.acertos, xpGanho: l.xp_ganho, sincronizadoOffline: l.sincronizado_offline,
});
export const paraResposta = (l: any): RespostaQuiz => ({
  id: String(l.id), usuarioId: l.usuario_id, quizId: l.quiz_id, questaoId: l.questao_id, trilhaId: l.trilha_id, nivelQuestao: l.nivel_questao,
  alternativaMarcada: l.alternativa_marcada, acertou: l.acertou, xpGanho: l.xp_ganho, nivelTrilhaApos: l.nivel_trilha_apos, respondidaEm: iso(l.respondida_em)!,
});
export const paraSimulacao = (l: any): Simulacao => ({
  id: String(l.id), usuarioId: l.usuario_id, tipoSimulacao: l.tipo_simulacao, parametros: l.parametros, resultadoFinal: Number(l.resultado_final), criadaEm: iso(l.criada_em)!,
});
export const paraNotificacao = (l: any): Notificacao => ({
  id: String(l.id), usuarioId: l.usuario_id, tipo: l.tipo, mensagem: l.mensagem, link: l.link, dataEnvio: iso(l.data_envio)!, lida: l.lida,
});
export const paraResumoTeste = (l: any): ResumoTeste => ({
  tipoTeste: l.tipoTeste, forma: l.forma, versao: l.versao, iniciadoEm: iso(l.iniciadoEm)!, concluidoEm: iso(l.concluidoEm),
  pontuacaoTotal: l.pontuacaoTotal, respondidas: Number(l.respondidas),
});
/* eslint-enable @typescript-eslint/no-explicit-any */
