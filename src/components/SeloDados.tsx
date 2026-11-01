import { Badge } from '@/components/ui/badge';
import { MODO_DADOS } from '@/dados/repositorios';

/** Dado de demonstração aparece sempre marcado como fictício (CLAUDE.md, Pesquisa e privacidade). */
export function SeloDados({ variante }: { variante: 'admin' | 'ranking' }) {
  const texto = MODO_DADOS === 'supabase'
    ? 'Contas de teste (projeto de desenvolvimento)'
    : variante === 'ranking' ? 'Participantes fictícios (demonstração)' : 'Dados de demonstração (fictícios)';
  return <Badge variant="outline">{texto}</Badge>;
}
