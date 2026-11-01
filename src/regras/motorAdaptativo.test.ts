import { describe, expect, it } from 'vitest';
import { criarDadosDemo } from '@/dados/demo';
import { ESTRUTURA_QUESTOES_BASE as ESTRUTURA_QUESTOES } from '@/dados/demo/estruturaQuestoes';
import type { Nivel } from '@/dados/tipos';
import { xpPorResposta } from './gamificacao';
import {
  grupoPreferido, nivelAtualDaTrilha, PARAMETROS_MOTOR_PADRAO, porData, proximoNivel, selecionarProximaQuestao,
  type CandidataQuestao,
} from './motorAdaptativo';

const P = PARAMETROS_MOTOR_PADRAO;
const C = true;
const E = false;
const candidatas = (trilhaId: string): CandidataQuestao[] =>
  ESTRUTURA_QUESTOES.filter((q) => q.trilhaId === trilhaId).map((q) => ({ id: q.id, licaoOrdem: q.licaoOrdem, nivel: q.nivel, ativa: true }));

/** Aplica o motor a uma sequência de acertos, começando no Médio. */
function simular(acertos: boolean[], p = P): Nivel {
  let nivel: Nivel = 'medio';
  acertos.forEach((_, k) => { nivel = proximoNivel(nivel, acertos.slice(0, k + 1), p); });
  return nivel;
}

describe('motor adaptativo (RN02)', () => {
  it('RN02: começa no Médio e não ajusta antes de a janela encher', () => {
    expect(nivelAtualDaTrilha([])).toBe('medio');
    expect(simular([C, C, C, C])).toBe('medio');
  });
  it('RN02: 4 ou 5 acertos em 5 sobem; 3 mantêm; 0 a 2 descem', () => {
    expect(proximoNivel('medio', [C, C, C, C, E], P)).toBe('dificil');
    expect(proximoNivel('medio', [C, C, C, E, E], P)).toBe('medio');
    expect(proximoNivel('medio', [C, C, E, E, E], P)).toBe('facil');
  });
  it('RN02: não passa de Difícil nem de Fácil', () => {
    expect(proximoNivel('dificil', [C, C, C, C, C], P)).toBe('dificil');
    expect(proximoNivel('facil', [E, E, E, E, E], P)).toBe('facil');
  });
  it('RN02: a janela é deslizante e não zera quando o nível muda', () => {
    expect(proximoNivel('dificil', [E, C, C, C, C, E], P)).toBe('dificil'); // últimas 5: C C C C E = 4
    expect(proximoNivel('medio', [C, C, C, C, C, E, E, E], P)).toBe('facil'); // últimas 5: C C E E E = 2
  });
  it('RN02: janela e limiares vêm dos parâmetros (RF11)', () => {
    const outros = { janela: 3, limiarSubida: 70, limiarDescida: 30 };
    expect(proximoNivel('medio', [C, C, E], outros)).toBe('medio'); // 66,7%
    expect(proximoNivel('medio', [C, C, C], outros)).toBe('dificil');
    expect(proximoNivel('medio', [C, E, E], outros)).toBe('medio'); // 33,3%
    expect(proximoNivel('medio', [E, E, E], outros)).toBe('facil');
  });
  it('RN02: perfis sintéticos determinísticos — 30% desce, 60% mantém, 90% sobe', () => {
    const repetir = (padrao: boolean[], vezes: number) => Array.from({ length: vezes }, () => padrao).flat();
    expect(simular(repetir([C, E, E, C, E, E, C, E, E, E], 3))).toBe('facil');
    expect(simular(repetir([C, C, C, E, E], 6))).toBe('medio');
    expect(simular(repetir([C, C, C, C, C, C, C, C, C, E], 3))).toBe('dificil');
  });
});

describe('seleção da próxima questão (RN02, decisões 2 e 9)', () => {
  const daTrilha = candidatas('juros-compostos');
  const base = { questoesDaTrilha: daTrilha, respondidasPeloJovem: [], respondidasNesteQuiz: [] };

  it('prefere o nível atual e, nele, a lição atual', () => {
    expect(grupoPreferido({ ...base, nivelAtual: 'medio', licaoAtualOrdem: 2 })).toEqual(['juros-compostos-2-m1', 'juros-compostos-2-m2']);
  });
  it('nunca usa questão de lição seguinte', () => {
    expect(grupoPreferido({ ...base, nivelAtual: 'dificil', licaoAtualOrdem: 1 })).toEqual(['juros-compostos-1-m1', 'juros-compostos-1-m2', 'juros-compostos-1-m3']);
  });
  it('sem candidatas no nível atual, vai ao mais próximo; no empate, ao mais fácil', () => {
    const medioDaLicao1 = ['juros-compostos-1-m1', 'juros-compostos-1-m2', 'juros-compostos-1-m3'];
    const respondidas = medioDaLicao1.map((id, i) => ({ questaoId: id, respondidaEm: `2026-01-01T00:00:0${i}.000Z` }));
    expect(grupoPreferido({ ...base, respondidasPeloJovem: respondidas, nivelAtual: 'medio', licaoAtualOrdem: 1 })).toEqual(['juros-compostos-1-f1']);
  });
  it('ignora questões inativas e já respondidas', () => {
    const comInativa = daTrilha.map((q) => (q.id === 'juros-compostos-2-m1' ? { ...q, ativa: false } : q));
    const respondida = [{ questaoId: 'juros-compostos-2-m2', respondidaEm: '2026-01-01T00:00:00.000Z' }];
    expect(grupoPreferido({ ...base, questoesDaTrilha: comInativa, respondidasPeloJovem: respondida, nivelAtual: 'medio', licaoAtualOrdem: 2 }))
      .toEqual(['juros-compostos-1-m1', 'juros-compostos-1-m2', 'juros-compostos-1-m3']);
  });
  it('caso extremo: repete a respondida há mais tempo, nunca uma deste quiz', () => {
    const daLicao1 = daTrilha.filter((q) => q.licaoOrdem === 1);
    const respondidas = daLicao1.map((q, i) => ({ questaoId: q.id, respondidaEm: `2026-01-0${i + 1}T00:00:00.000Z` }));
    expect(grupoPreferido({ ...base, respondidasPeloJovem: respondidas, nivelAtual: 'medio', licaoAtualOrdem: 1 })).toEqual([daLicao1[0].id]);
    expect(grupoPreferido({ ...base, respondidasPeloJovem: respondidas, respondidasNesteQuiz: [daLicao1[0].id], nivelAtual: 'medio', licaoAtualOrdem: 1 })).toEqual([daLicao1[1].id]);
  });
  it('o sorteio usa a fonte de aleatoriedade recebida', () => {
    expect(selecionarProximaQuestao({ ...base, nivelAtual: 'medio', licaoAtualOrdem: 2, aleatorio: () => 0 })).toBe('juros-compostos-2-m1');
    expect(selecionarProximaQuestao({ ...base, nivelAtual: 'medio', licaoAtualOrdem: 2, aleatorio: () => 0.99 })).toBe('juros-compostos-2-m2');
  });
});

describe('dados de demonstração reproduzidos pelo motor (PRD 6.4 e 6.9)', () => {
  const banco = criarDadosDemo(new Date('2026-11-04T15:00:00Z'));

  it.each(['orcamento-pessoal', 'juros-compostos'])('RN02: histórico do jovem principal em %s, escolha a escolha', (trilhaId) => {
    const respostas = banco.respostasQuiz.filter((r) => r.trilhaId === trilhaId).sort(porData);
    let nivel: Nivel = 'medio';
    respostas.forEach((r, k) => {
      const anteriores = respostas.slice(0, k);
      const licaoAtualOrdem = Number(r.quizId.match(/-(\d)-quiz$/)![1]);
      const grupo = grupoPreferido({
        nivelAtual: nivel, licaoAtualOrdem, questoesDaTrilha: candidatas(trilhaId),
        respondidasPeloJovem: anteriores.map((a) => ({ questaoId: a.questaoId, respondidaEm: a.respondidaEm })),
        respondidasNesteQuiz: anteriores.filter((a) => a.quizId === r.quizId).map((a) => a.questaoId),
      });
      expect(grupo).toContain(r.questaoId);
      nivel = proximoNivel(nivel, [...anteriores.map((a) => a.acertou), r.acertou], P);
      expect(nivel).toBe(r.nivelTrilhaApos);
    });
  });

  it('RN02 e RN03: roteiro — 3 acertos na lição 2 de Juros Compostos sobem para Difícil e dão +75 XP', () => {
    const respostas = banco.respostasQuiz.filter((r) => r.trilhaId === 'juros-compostos').sort(porData);
    const historico = respostas.map((r) => ({ questaoId: r.questaoId, respondidaEm: r.respondidaEm }));
    const acertos = respostas.map((r) => r.acertou);
    const noQuiz: string[] = [];
    const niveis: Nivel[] = [];
    let nivel = nivelAtualDaTrilha(respostas);
    let xp = 0;
    for (let k = 0; k < 3; k++) {
      const [id] = grupoPreferido({ nivelAtual: nivel, licaoAtualOrdem: 2, questoesDaTrilha: candidatas('juros-compostos'), respondidasPeloJovem: historico, respondidasNesteQuiz: noQuiz });
      const escolhida = candidatas('juros-compostos').find((q) => q.id === id)!;
      niveis.push(escolhida.nivel);
      xp += xpPorResposta(escolhida.nivel, true);
      acertos.push(true);
      historico.push({ questaoId: id, respondidaEm: `2099-01-01T00:00:0${k}.000Z` });
      noQuiz.push(id);
      nivel = proximoNivel(nivel, acertos, P);
      if (k === 1) expect(nivel).toBe('dificil'); // sobe depois da 2ª resposta (4 de 5)
    }
    expect(niveis).toEqual(['medio', 'medio', 'dificil']);
    expect(xp).toBe(75);
  });
});
