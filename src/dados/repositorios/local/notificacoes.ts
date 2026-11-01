import { alterarBanco, carregarBanco } from '@/dados/bancoLocal';
import { TRILHAS } from '@/dados/demo/trilhas';
import type { Notificacao } from '@/dados/tipos';
import { agora } from '@/lib/relogio';
import { calcularProgressoTrilha } from '@/regras/progresso';
import { deveGerarLembrete } from '@/regras/sequencia';
import type { RepositorioNotificacoes } from '../contratos';
import { parametrosAtuaisLocal, responder, usuarioDaSessao } from './comum';

export const notificacoesLocal: RepositorioNotificacoes = {
  minhasNotificacoes: () =>
    responder(
      carregarBanco().notificacoes
        .filter((n) => n.usuarioId === usuarioDaSessao())
        .sort((a, b) => b.dataEnvio.localeCompare(a.dataEnvio)),
    ),

  async marcarComoLida(id) {
    const usuarioId = usuarioDaSessao();
    alterarBanco((banco) => {
      const n = banco.notificacoes.find((x) => x.id === id && x.usuarioId === usuarioId);
      if (n) n.lida = true;
    });
    await responder(null);
  },

  async marcarTodasComoLidas() {
    const usuarioId = usuarioDaSessao();
    alterarBanco((banco) => banco.notificacoes.filter((n) => n.usuarioId === usuarioId).forEach((n) => { n.lida = true; }));
    await responder(null);
  },

  /** RF09 e RN04: lembrete dentro do app, uma vez por período de inatividade. Push real fica para depois. */
  async verificarLembrete() {
    const usuarioId = usuarioDaSessao();
    const nova = alterarBanco((banco): Notificacao | null => {
      const usuario = banco.usuarios.find((u) => u.id === usuarioId)!;
      const instante = agora();
      const parametros = parametrosAtuaisLocal(banco);
      const progressos = banco.progressos.filter((p) => p.usuarioId === usuarioId);
      const respostas = banco.respostasQuiz.filter((r) => r.usuarioId === usuarioId);
      const emAndamento = TRILHAS
        .map((trilha) => ({ trilha, p: calcularProgressoTrilha(trilha.id, progressos, respostas, parametros.janela_motor) }))
        .filter((x) => x.p.status === 'em_andamento')
        .sort((a, b) => (b.p.dataUltimoAcesso ?? '').localeCompare(a.p.dataUltimoAcesso ?? ''));
      const ultimoLembreteEm = banco.notificacoes.filter((n) => n.usuarioId === usuarioId && n.tipo === 'lembrete').map((n) => n.dataEnvio).sort().at(-1) ?? null;
      const gerar = deveGerarLembrete({
        receberLembretes: usuario.receberLembretes, temTrilhaEmAndamento: emAndamento.length > 0, ultimaAtividadeEm: usuario.ultimaAtividadeEm,
        ultimoLembreteEm, limiteHoras: parametros.limite_inatividade_horas, agora: instante,
      });
      if (!gerar) return null;
      const { trilha, p } = emAndamento[0];
      const notificacao: Notificacao = {
        id: crypto.randomUUID(), usuarioId, tipo: 'lembrete', link: `/trilhas/${trilha.slug}`, dataEnvio: instante.toISOString(), lida: false,
        mensagem: `Sua trilha ${trilha.titulo} está esperando por você. Que tal continuar a Lição ${p.licoesConcluidas + 1}?`,
      };
      banco.notificacoes.push(notificacao);
      return notificacao;
    });
    return responder(nova);
  },
};
