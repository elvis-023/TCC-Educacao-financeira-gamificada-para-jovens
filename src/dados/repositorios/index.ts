import type { Repositorios } from './contratos';
import { repositoriosLocais } from './local';
import { repositoriosSupabase } from './supabase';

/** Escolhido pelo .env (VITE_FONTE_DADOS): "local" (padrão, dados de demonstração) ou "supabase" (contas reais). */
export const MODO_DADOS: 'local' | 'supabase' = import.meta.env.VITE_FONTE_DADOS === 'supabase' ? 'supabase' : 'local';
export const repositorios: Repositorios = MODO_DADOS === 'supabase' ? repositoriosSupabase : repositoriosLocais;
