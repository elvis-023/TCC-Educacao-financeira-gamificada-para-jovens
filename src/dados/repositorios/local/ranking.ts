import { carregarBanco } from '@/dados/bancoLocal';
import { agora } from '@/lib/relogio';
import { montarRanking, xpDaSemana } from '@/regras/gamificacao';
import type { RepositorioRanking } from '../contratos';
import { responder, usuarioDaSessao } from './comum';

export const rankingLocal: RepositorioRanking = {
  async ranking(periodo) {
    const banco = carregarBanco();
    const jovens = banco.usuarios.filter((u) => u.papel === 'jovem');
    const entradas = jovens.map((u) => ({
      usuarioId: u.id,
      nome: u.nome,
      xp: periodo === 'geral'
        ? u.xpTotal
        // Os 11 fictícios têm o XP da semana fixo; o jovem real soma as respostas da semana.
        : u.xpSemanaFicticio ?? xpDaSemana([...banco.respostasQuiz, ...banco.respostasTreino].filter((r) => r.usuarioId === u.id), agora()),
    }));
    return responder(montarRanking(entradas, usuarioDaSessao()));
  },
};
