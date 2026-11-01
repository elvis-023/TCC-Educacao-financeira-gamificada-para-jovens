import { describe, expect, it } from 'vitest';
import { BADGES } from '@/dados/demo/badges';
import { criarDadosDemo } from '@/dados/demo';
import { ID_ALEX } from '@/dados/demo/usuarios';
import {
  montarRanking, nomeDeExibicao, proximaConquista, verificarConquistas, xpDaSemana, xpPorResposta, type SituacaoConquistas,
} from './gamificacao';

describe('XP (RN03)', () => {
  it('RN03: acerto Fácil 10, Médio 20, Difícil 35; erro 2', () => {
    expect([xpPorResposta('facil', true), xpPorResposta('medio', true), xpPorResposta('dificil', true)]).toEqual([10, 20, 35]);
    expect([xpPorResposta('facil', false), xpPorResposta('dificil', false)]).toEqual([2, 2]);
  });
});

const base: SituacaoConquistas = {
  quizzesConcluidos: 1, trilhasConcluidas: 0, maiorNumeroDeLicoesNumaTrilha: 1, sequenciaDias: 1,
  acertosNoQuiz: 2, questoesNoQuiz: 3, chegouAoDificil: false, jaConquistadas: [],
};

describe('conquistas (RF08)', () => {
  it('RF08: cada critério', () => {
    expect(verificarConquistas(base)).toEqual(['primeiro_quiz']);
    expect(verificarConquistas({ ...base, acertosNoQuiz: 3 })).toEqual(['primeiro_quiz', 'gabaritou']);
    expect(verificarConquistas({ ...base, sequenciaDias: 7 })).toEqual(['primeiro_quiz', 'sequencia_7_dias']);
    expect(verificarConquistas({ ...base, chegouAoDificil: true })).toEqual(['primeiro_quiz', 'desafio_aceito']);
    expect(verificarConquistas({ ...base, trilhasConcluidas: 4 })).toEqual(['primeiro_quiz', 'primeira_trilha', 'mestre_das_financas']);
  });
  it('RF08: nunca duplica', () => {
    expect(verificarConquistas({ ...base, acertosNoQuiz: 3, jaConquistadas: ['primeiro_quiz', 'gabaritou'] })).toEqual([]);
  });
  it('próxima conquista: a primeira bloqueada na ordem da lista, com o progresso', () => {
    const p = proximaConquista(BADGES, ['primeiro_quiz', 'primeira_trilha'], { ...base, sequenciaDias: 4 });
    expect(p).toEqual({ badge: BADGES[2], progresso: '4 de 7 dias' });
  });
  it('próxima conquista: nenhuma quando todas foram conquistadas', () => {
    expect(proximaConquista(BADGES, BADGES.map((b) => b.id), base)).toBeNull();
  });
});

describe('ranking (RF07, RNF04)', () => {
  it('nome de exibição: primeiro nome e inicial do último sobrenome', () => {
    expect(nomeDeExibicao('Bruna Moreira')).toBe('Bruna M.');
    expect(nomeDeExibicao('Ana Clara de Souza')).toBe('Ana S.');
    expect(nomeDeExibicao('Alex')).toBe('Alex');
  });
  it('RF07: ordem por XP; empate na mesma posição (1, 2, 2, 4), em ordem alfabética', () => {
    const r = montarRanking([
      { usuarioId: 'a', nome: 'Zé Silva', xp: 50 }, { usuarioId: 'b', nome: 'Ana Lima', xp: 50 },
      { usuarioId: 'c', nome: 'Bia Reis', xp: 90 }, { usuarioId: 'd', nome: 'Caio Melo', xp: 10 },
    ], 'b');
    expect(r.map((l) => [l.posicao, l.nomeExibicao, l.xp, l.ehVoce])).toEqual([
      [1, 'Bia R.', 90, false], [2, 'Ana L.', 50, true], [2, 'Zé S.', 50, false], [4, 'Caio M.', 10, false],
    ]);
  });
  it('RF07: com os dados de demonstração, Alex em 7º com 120 XP; com +75 XP, 6º', () => {
    const banco = criarDadosDemo(new Date('2026-11-04T15:00:00Z'));
    const jovens = banco.usuarios.filter((u) => u.papel === 'jovem').map((u) => ({ usuarioId: u.id, nome: u.nome, xp: u.xpTotal }));
    expect(montarRanking(jovens, ID_ALEX).find((l) => l.ehVoce)).toMatchObject({ posicao: 7, xp: 120 });
    const depois = jovens.map((j) => (j.usuarioId === ID_ALEX ? { ...j, xp: 195 } : j));
    expect(montarRanking(depois, ID_ALEX).find((l) => l.ehVoce)).toMatchObject({ posicao: 6, xp: 195 });
  });
  it('RNF04: a linha do ranking só tem posição, nome de exibição, XP e se é o próprio jovem', () => {
    const [linha] = montarRanking([{ usuarioId: 'a', nome: 'Zé Silva', xp: 1 }], null);
    expect(Object.keys(linha).sort()).toEqual(['ehVoce', 'nomeExibicao', 'posicao', 'xp']);
  });
  it('esta semana: de segunda 00h00 em São Paulo até agora', () => {
    const agora = new Date('2026-11-04T15:00:00Z');
    const respostas = [
      { xpGanho: 20, respondidaEm: '2026-11-02T03:00:00.000Z' }, // segunda 00h00 em SP: conta
      { xpGanho: 35, respondidaEm: '2026-11-02T02:59:00.000Z' }, // domingo 23h59 em SP: não conta
    ];
    expect(xpDaSemana(respostas, agora)).toBe(20);
  });
});
