import type { BancoDados } from '@/dados/bancoLocal';
import { criarHistoricoDoAlex } from './historico';
import { criarNotificacoes } from './notificacoes';
import { criarParametros } from './parametros';
import { criarPesquisa } from './pesquisa';
import { QUESTOES } from './questoes';
import { criarUsuarios } from './usuarios';

/** Aumente quando os dados de demonstração mudarem: o banco do aparelho é recriado. */
export const VERSAO_DADOS = 3;

export function criarDadosDemo(agora: Date): BancoDados {
  const historico = criarHistoricoDoAlex(agora);
  const pesquisa = criarPesquisa(agora);
  return {
    versao: VERSAO_DADOS,
    usuarios: criarUsuarios(agora),
    pseudonimos: pesquisa.pseudonimos,
    questoes: structuredClone(QUESTOES),
    respostasQuiz: historico.respostasQuiz,
    respostasTreino: [],
    progressos: historico.progressos,
    simulacoes: [],
    usuarioBadges: historico.usuarioBadges,
    notificacoes: criarNotificacoes(agora),
    testes: pesquisa.testes,
    respostasTeste: pesquisa.respostasTeste,
    parametros: criarParametros(agora),
  };
}
