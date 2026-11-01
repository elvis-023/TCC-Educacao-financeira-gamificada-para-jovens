import type { Repositorios } from '../contratos';
import { conteudoSupabase } from './conteudo';
import { notificacoesSupabase } from './notificacoes';
import { progressoSupabase } from './progresso';
import { quizSupabase } from './quiz';
import { sessaoSupabase } from './sessao';
import { simulacoesSupabase } from './simulacoes';
import { testesSupabase } from './testes';
import { usuarioSupabase } from './usuario';

export const repositoriosSupabase: Repositorios = {
  sessao: sessaoSupabase,
  usuario: usuarioSupabase,
  conteudo: conteudoSupabase,
  progresso: progressoSupabase,
  quiz: quizSupabase,
  testes: testesSupabase,
  notificacoes: notificacoesSupabase,
  simulacoes: simulacoesSupabase,
};
