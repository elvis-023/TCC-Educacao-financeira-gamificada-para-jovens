import type { Repositorios } from '../contratos';
import { conteudoLocal } from './conteudo';
import { notificacoesLocal } from './notificacoes';
import { progressoLocal } from './progresso';
import { quizLocal } from './quiz';
import { sessaoLocal } from './sessao';
import { simulacoesLocal } from './simulacoes';
import { testesLocal } from './testes';
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
};
