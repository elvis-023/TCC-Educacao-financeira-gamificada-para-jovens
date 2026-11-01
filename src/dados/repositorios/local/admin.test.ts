import { beforeEach, describe, expect, it } from 'vitest';
import { atualizarAparelho } from '@/dados/aparelho';
import { carregarBanco, reiniciarBanco } from '@/dados/bancoLocal';
import { ID_ADMIN, ID_ALEX } from '@/dados/demo/usuarios';
import type { QuestaoEditavel } from '@/dados/tipos';
import { adminLocal } from './admin';

const nova = (extra: Partial<QuestaoEditavel> = {}): QuestaoEditavel => ({
  id: null, quizId: 'cartao-de-credito-2-quiz', enunciado: 'Qual imposto incide sobre operações financeiras?', alternativas: ['IOF', 'IPVA', 'IPTU', 'ISS'],
  respostaCorreta: 0, nivelDificuldade: 'facil', explicacao: 'O IOF é o imposto sobre operações financeiras.', ativa: true, ...extra,
});

describe('área do administrador no modo local (RF10, RF11, RF12)', () => {
  beforeEach(() => {
    reiniciarBanco();
    atualizarAparelho({ sessaoUsuarioId: ID_ADMIN });
  });

  it('o jovem não acessa nada da área do administrador', async () => {
    atualizarAparelho({ sessaoUsuarioId: ID_ALEX });
    await expect(adminLocal.metricasPesquisa()).rejects.toThrow('Área restrita ao administrador');
    await expect(adminLocal.exportarRespostas()).rejects.toThrow('Área restrita ao administrador');
    await expect(adminLocal.salvarParametros({ limite_inatividade_horas: 48, janela_motor: 5, limiar_subida: 80, limiar_descida: 40 })).rejects.toThrow('Área restrita');
  });

  it('RF12: 12 participantes, 12 pré, 5 pós, ganho médio observado de 26,7 p.p. (dados fictícios)', async () => {
    const m = await adminLocal.metricasPesquisa();
    expect(m).toMatchObject({ participantes: 12, preConcluidos: 12, posConcluidos: 5, nPares: 5 });
    expect(m.ganhoMedio).toBeCloseTo(26.667, 3);
  });

  it('RF10: lista as 336 questões e cria, edita e inativa sem excluir', async () => {
    expect(await adminLocal.listarQuestoes()).toHaveLength(336);
    const id = await adminLocal.salvarQuestao(nova());
    expect(await adminLocal.listarQuestoes()).toHaveLength(337);
    await adminLocal.salvarQuestao(nova({ id, ativa: false }));
    expect(carregarBanco().questoes.find((q) => q.id === id)!.ativa).toBe(false);
    expect(await adminLocal.listarQuestoes()).toHaveLength(337);
  });

  it('RF10: a lição 1 mantém 3 questões ativas: da 26ª inativação em diante, o servidor bloqueia', async () => {
    const daLicao1 = (await adminLocal.listarQuestoes()).filter((q) => q.licaoId === 'juros-compostos-1');
    expect(daLicao1).toHaveLength(28);
    const inativada = (q: (typeof daLicao1)[number]): QuestaoEditavel => ({ id: q.id, quizId: q.quizId, enunciado: q.enunciado, alternativas: q.alternativas, respostaCorreta: q.respostaCorreta, nivelDificuldade: q.nivelDificuldade, explicacao: q.explicacao, ativa: false });
    for (const q of daLicao1.slice(0, 25)) await adminLocal.salvarQuestao(inativada(q));
    await expect(adminLocal.salvarQuestao(inativada(daLicao1[25]))).rejects.toThrow('A lição 1 de cada trilha precisa de pelo menos 3 questões ativas');
    const ativas = (await adminLocal.listarQuestoes()).filter((q) => q.licaoId === 'juros-compostos-1' && q.ativa);
    expect(ativas).toHaveLength(3);
  });

  it('RF11: parâmetros com autor e data; só grava o que mudou; valida antes', async () => {
    const padrao = { limite_inatividade_horas: 48, janela_motor: 5, limiar_subida: 80, limiar_descida: 40 };
    await expect(adminLocal.salvarParametros({ ...padrao, limiar_descida: 80 })).rejects.toThrow('O limiar de descida precisa ser menor que o de subida');
    const antes = (await adminLocal.historicoParametros()).length;
    await adminLocal.salvarParametros({ ...padrao, janela_motor: 3 });
    const historico = await adminLocal.historicoParametros();
    expect(historico).toHaveLength(antes + 1);
    expect(historico[0]).toMatchObject({ chave: 'janela_motor', valor: 3, valorAnterior: 5, autor: 'Admin Demonstração' });
    expect((await adminLocal.parametrosAtuais()).janela_motor).toBe(3);
  });
});
