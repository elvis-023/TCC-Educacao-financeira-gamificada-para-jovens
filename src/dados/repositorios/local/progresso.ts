import { alterarBanco, carregarBanco } from '@/dados/bancoLocal';
import { LICOES } from '@/dados/demo/trilhas';
import { agora } from '@/lib/relogio';
import { estadoDaLicao } from '@/regras/progresso';
import type { RepositorioProgresso } from '../contratos';
import { estaOnline, registrarAtividade, responder, usuarioDaSessao } from './comum';

export const progressoLocal: RepositorioProgresso = {
  meusProgressos: () => responder(carregarBanco().progressos.filter((p) => p.usuarioId === usuarioDaSessao())),
  minhasRespostas: () => responder(carregarBanco().respostasQuiz.filter((r) => r.usuarioId === usuarioDaSessao())),
  async concluirLeitura(licaoId) {
    const usuarioId = usuarioDaSessao();
    alterarBanco((banco) => {
      const licao = LICOES.find((l) => l.id === licaoId);
      if (!licao) throw new Error('Lição não encontrada');
      const meus = banco.progressos.filter((p) => p.usuarioId === usuarioId);
      if (estadoDaLicao(licao, LICOES.filter((l) => l.trilhaId === licao.trilhaId), meus) === 'bloqueada') {
        throw new Error('Conclua a lição anterior para desbloquear');
      }
      if (meus.some((p) => p.licaoId === licaoId)) return; // só a primeira conclusão conta
      const instante = agora();
      banco.progressos.push({
        id: crypto.randomUUID(), usuarioId, trilhaId: licao.trilhaId, licaoId, leituraConcluidaEm: instante.toISOString(),
        quizConcluidoEm: null, acertos: 0, xpGanho: 0, sincronizadoOffline: estaOnline(),
      });
      registrarAtividade(banco, usuarioId, instante);
    });
    await responder(null);
  },
  async sincronizarPendentes() {
    const usuarioId = usuarioDaSessao();
    const quantidade = alterarBanco((banco) => {
      const pendentes = banco.progressos.filter((p) => p.usuarioId === usuarioId && !p.sincronizadoOffline);
      pendentes.forEach((p) => { p.sincronizadoOffline = true; });
      return pendentes.length;
    });
    return responder(quantidade);
  },
};
