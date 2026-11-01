import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Cliente do Supabase. A chave é a publishable, pública por design; quem protege os dados é a RLS. */
export const supabase = url && chave ? createClient(url, chave) : null;

export function cliente() {
  if (!supabase) throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env');
  return supabase;
}
