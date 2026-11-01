import { createContext } from 'react';
import type { Sessao } from '@/dados/tipos';

export const ContextoSessao = createContext<{ sessao: Sessao | null; carregando: boolean } | null>(null);
