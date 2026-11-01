import { beforeEach, describe, expect, it } from 'vitest';
import { atualizarAparelho } from '@/dados/aparelho';
import { reiniciarBanco } from '@/dados/bancoLocal';
import { ID_ADMIN, ID_ALEX } from '@/dados/demo/usuarios';
import { notificacoesLocal } from './notificacoes';

describe('notificações no modo local (RF09)', () => {
  beforeEach(() => {
    reiniciarBanco();
    atualizarAparelho({ sessaoUsuarioId: ID_ALEX });
  });

  it('o jovem principal tem 3 notificações, da mais recente para a mais antiga, e 1 não lida', async () => {
    const lista = await notificacoesLocal.minhasNotificacoes();
    expect(lista.map((n) => n.id)).toEqual(['demo-notif-3', 'demo-notif-1', 'demo-notif-2']);
    expect(lista.filter((n) => !n.lida)).toHaveLength(1);
    expect(lista[0].mensagem).toBe('Faltam 3 dias para a conquista Sequência de 7 dias. Continue estudando!');
  });
  it('cada pessoa vê só as próprias notificações', async () => {
    atualizarAparelho({ sessaoUsuarioId: ID_ADMIN });
    expect(await notificacoesLocal.minhasNotificacoes()).toEqual([]);
  });
});
