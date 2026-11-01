import { beforeEach, describe, expect, it } from 'vitest';
import { atualizarAparelho } from '@/dados/aparelho';
import { reiniciarBanco } from '@/dados/bancoLocal';
import { ID_ADMIN, ID_ALEX } from '@/dados/demo/usuarios';
import { alterarBanco } from '@/dados/bancoLocal';
import { avancarRelogio } from '@/lib/relogio';
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

  it('marcar como lida e marcar todas', async () => {
    await notificacoesLocal.marcarComoLida('demo-notif-3');
    expect((await notificacoesLocal.minhasNotificacoes()).filter((n) => !n.lida)).toHaveLength(0);
    alterarBanco((banco) => { banco.notificacoes[0].lida = false; banco.notificacoes[1].lida = false; });
    await notificacoesLocal.marcarTodasComoLidas();
    expect((await notificacoesLocal.minhasNotificacoes()).every((n) => n.lida)).toBe(true);
  });
  it('RF09 e RN04: lembrete só depois do limite de inatividade, uma vez por período, e nunca se desligado', async () => {
    atualizarAparelho({ deslocamentoRelogioMs: 0 });
    expect(await notificacoesLocal.verificarLembrete()).toBeNull();
    avancarRelogio(48);
    const lembrete = await notificacoesLocal.verificarLembrete();
    expect(lembrete).toMatchObject({ tipo: 'lembrete', lida: false });
    expect(lembrete!.mensagem).toMatch(/^Sua trilha .* está esperando por você\./);
    expect(await notificacoesLocal.verificarLembrete()).toBeNull(); // não repete
    reiniciarBanco();
    atualizarAparelho({ sessaoUsuarioId: ID_ALEX, deslocamentoRelogioMs: 48 * 3_600_000 });
    alterarBanco((banco) => { banco.usuarios.find((u) => u.id === ID_ALEX)!.receberLembretes = false; });
    expect(await notificacoesLocal.verificarLembrete()).toBeNull();
  });
});
