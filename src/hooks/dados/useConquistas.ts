import { useQuery } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import type { CodigoBadge } from '@/dados/tipos';
import { diaNoFuso } from '@/lib/fuso';
import { agora } from '@/lib/relogio';
import type { SituacaoConquistas } from '@/regras/gamificacao';
import { trilhasConcluidas } from '@/regras/progresso';
import { sequenciaAtual } from '@/regras/sequencia';
import { chaves } from './chaves';
import { useTrilhas } from './useConteudo';
import { useMinhasRespostas, useProgressos } from './useProgresso';
import { useMeuUsuario } from './useUsuario';

export const useConquistas = () => useQuery({ queryKey: chaves.conquistas, queryFn: () => repositorios.conquistas.minhasConquistas() });

/** Retrato do jovem para os textos de progresso das conquistas bloqueadas (PRD 2.8 e 2.10). */
export function useSituacaoConquistas(): { carregando: boolean; situacao: SituacaoConquistas | null; conquistadas: CodigoBadge[] } {
  const conquistas = useConquistas();
  const trilhas = useTrilhas();
  const progressos = useProgressos();
  const respostas = useMinhasRespostas();
  const usuario = useMeuUsuario();
  const carregando = conquistas.isPending || trilhas.isPending || progressos.isPending || respostas.isPending || usuario.isPending;
  if (carregando || !usuario.data) return { carregando: true, situacao: null, conquistadas: [] };

  const meus = progressos.data ?? [];
  const conquistadas = (conquistas.data ?? []).map((c) => c.badgeId);
  const concluidasPorTrilha = (trilhas.data ?? []).map((t) => meus.filter((p) => p.trilhaId === t.id && p.quizConcluidoEm).length);
  return {
    carregando: false,
    conquistadas,
    situacao: {
      quizzesConcluidos: meus.filter((p) => p.quizConcluidoEm).length,
      trilhasConcluidas: trilhasConcluidas(meus),
      maiorNumeroDeLicoesNumaTrilha: Math.max(0, ...concluidasPorTrilha),
      sequenciaDias: sequenciaAtual(usuario.data.diasStreak, usuario.data.ultimoDiaUso, diaNoFuso(agora())),
      acertosNoQuiz: 0,
      questoesNoQuiz: 0,
      chegouAoDificil: (respostas.data ?? []).some((r) => r.nivelTrilhaApos === 'dificil'),
      jaConquistadas: conquistadas,
    },
  };
}
