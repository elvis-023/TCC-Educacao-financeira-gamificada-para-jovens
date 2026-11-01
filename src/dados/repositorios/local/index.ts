import type { Repositorios } from '../contratos';
import { conteudoLocal } from './conteudo';
import { progressoLocal } from './progresso';
import { sessaoLocal } from './sessao';
import { simulacoesLocal } from './simulacoes';
import { testesLocal } from './testes';

export const repositoriosLocais: Repositorios = {
  sessao: sessaoLocal,
  conteudo: conteudoLocal,
  progresso: progressoLocal,
  testes: testesLocal,
  simulacoes: simulacoesLocal,
};
