import type { Repositorios } from '../contratos';
import { adminLocal } from './admin';
import { conquistasLocal } from './conquistas';
import { conteudoLocal } from './conteudo';
import { demonstracaoLocal } from './demonstracao';
import { notificacoesLocal } from './notificacoes';
import { progressoLocal } from './progresso';
import { quizLocal } from './quiz';
import { rankingLocal } from './ranking';
import { sessaoLocal } from './sessao';
import { simulacoesLocal } from './simulacoes';
import { testesLocal } from './testes';
import { treinoLocal } from './treino';
import { usuarioLocal } from './usuario';

export const repositoriosLocais: Repositorios = {
  sessao: sessaoLocal,
  usuario: usuarioLocal,
  conteudo: conteudoLocal,
  progresso: progressoLocal,
  quiz: quizLocal,
  testes: testesLocal,
  notificacoes: notificacoesLocal,
  simulacoes: simulacoesLocal,
  conquistas: conquistasLocal,
  ranking: rankingLocal,
  demonstracao: demonstracaoLocal,
  admin: adminLocal,
  treino: treinoLocal,
};
