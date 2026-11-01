import { atualizarAparelho } from '@/dados/aparelho';
import { carregarBanco, reiniciarBanco } from '@/dados/bancoLocal';
import { avancarRelogio, zerarRelogio } from '@/lib/relogio';
import type { RepositorioDemonstracao } from '../contratos';
import { parametrosAtuaisLocal, responder } from './comum';

/** Ferramentas só para a apresentação do TCC; só existem no modo local, com dados fictícios. */
export const demonstracaoLocal: RepositorioDemonstracao = {
  disponivel: true,
  limiteDeInatividade: () => responder(parametrosAtuaisLocal(carregarBanco()).limite_inatividade_horas),
  async avancarRelogio(horas) {
    avancarRelogio(horas);
    await responder(null);
  },
  async liberarPosTeste() {
    atualizarAparelho({ posTesteLiberadoDemo: true });
    await responder(null);
  },
  async reiniciar() {
    zerarRelogio();
    atualizarAparelho({ posTesteLiberadoDemo: false });
    reiniciarBanco();
    await responder(null);
  },
};
