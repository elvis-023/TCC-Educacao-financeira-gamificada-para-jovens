import type { Repositorios } from '../contratos';
import { conteudoLocal } from './conteudo';
import { sessaoLocal } from './sessao';
import { simulacoesLocal } from './simulacoes';
import { testesLocal } from './testes';

export const repositoriosLocais: Repositorios = {
  sessao: sessaoLocal,
  conteudo: conteudoLocal,
  testes: testesLocal,
  simulacoes: simulacoesLocal,
};
