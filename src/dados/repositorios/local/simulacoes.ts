import type { Simulacao } from '@/dados/tipos';
import { alterarBanco, carregarBanco } from '@/dados/bancoLocal';
import { agora } from '@/lib/relogio';
import type { RepositorioSimulacoes } from '../contratos';
import { responder, usuarioDaSessao } from './comum';

export const simulacoesLocal: RepositorioSimulacoes = {
  minhasSimulacoes: () =>
    responder(
      carregarBanco().simulacoes
        .filter((s) => s.usuarioId === usuarioDaSessao())
        .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
        .slice(0, 10),
    ),
  async salvar(simulacao) {
    alterarBanco((banco) => {
      banco.simulacoes.push({ ...simulacao, id: crypto.randomUUID(), usuarioId: usuarioDaSessao(), criadaEm: agora().toISOString() } as Simulacao);
    });
    await responder(null);
  },
};
