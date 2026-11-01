import type { RepositorioDemonstracao } from '../contratos';
import { naoDisponivel } from './comum';

// Com a base de dados real não há ferramentas de demonstração (PRD 8.8): nada de mexer no relógio nem apagar dados.
export const demonstracaoSupabase: RepositorioDemonstracao = {
  disponivel: false,
  limiteDeInatividade: naoDisponivel,
  avancarRelogio: naoDisponivel,
  liberarPosTeste: naoDisponivel,
  reiniciar: naoDisponivel,
};
