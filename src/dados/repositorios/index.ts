import type { Repositorios } from './contratos';
import { repositoriosLocais } from './local';

// E2.5: escolhe entre local e supabase pela variável VITE_FONTE_DADOS.
export const repositorios: Repositorios = repositoriosLocais;
