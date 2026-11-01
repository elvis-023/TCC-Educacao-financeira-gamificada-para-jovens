import { carregarBanco } from '@/dados/bancoLocal';
import type { RepositorioNotificacoes } from '../contratos';
import { responder, usuarioDaSessao } from './comum';

// Os demais métodos (marcar como lida e lembretes) entram no passo 20.
export const notificacoesLocal: RepositorioNotificacoes = {
  minhasNotificacoes: () =>
    responder(
      carregarBanco().notificacoes
        .filter((n) => n.usuarioId === usuarioDaSessao())
        .sort((a, b) => b.dataEnvio.localeCompare(a.dataEnvio)),
    ),
};
