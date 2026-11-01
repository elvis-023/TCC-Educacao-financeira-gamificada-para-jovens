import type { Repositorios } from '../contratos';
import { conteudoLocal } from './conteudo';
import { simulacoesLocal } from './simulacoes';

export const repositoriosLocais: Repositorios = { conteudo: conteudoLocal, simulacoes: simulacoesLocal };
