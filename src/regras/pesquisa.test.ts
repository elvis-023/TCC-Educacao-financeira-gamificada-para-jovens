import { describe, expect, it } from 'vitest';
import { criarDadosDemo } from '@/dados/demo';
import { PERGUNTAS_DIAGNOSTICAS } from '@/dados/demo/perguntasDiagnosticas';
import { calcularMetricas, diferencaPp, formaDoTeste, linhasDeExportacao, percentualDeAcerto } from './pesquisa';

describe('teste diagnóstico (RF05)', () => {
  it('RF05: pré-teste usa a Forma A e pós-teste a Forma B', () => {
    expect(formaDoTeste('pre')).toBe('A');
    expect(formaDoTeste('pos')).toBe('B');
  });
  it('RF05: percentual de acerto e diferença em pontos percentuais', () => {
    expect(percentualDeAcerto(1, 3)).toBeCloseTo(33.333, 3);
    expect(diferencaPp(1, 3, 3)).toBeCloseTo(66.667, 3);
    expect(diferencaPp(3, 2, 3)).toBeCloseTo(-33.333, 3);
  });
});

describe('métricas da pesquisa (RF12)', () => {
  const banco = criarDadosDemo(new Date('2026-11-04T15:00:00Z'));
  const m = calcularMetricas({ participantes: 12, testes: banco.testes, respostas: banco.respostasTeste, perguntas: PERGUNTAS_DIAGNOSTICAS });

  it('RF12: contagens e ganho observado médio só de quem fez os dois testes', () => {
    expect(m).toMatchObject({ participantes: 12, preConcluidos: 12, posConcluidos: 5, nPares: 5 });
    expect(m.ganhoMedio).toBeCloseTo(26.667, 3);
  });
  it('RF12: acerto por pergunta, só dos pares', () => {
    expect(m.porPergunta.map((p) => [p.numero, Math.round(p.pre), Math.round(p.pos)])).toEqual([[1, 80, 100], [2, 60, 60], [3, 20, 80]]);
  });
  it('RNF06: a tabela só tem pseudônimos', () => {
    expect(m.participantesTabela).toHaveLength(12);
    expect(m.participantesTabela.every((p) => /^P-[0-9A-F]{4,8}$/.test(p.pseudonimo))).toBe(true);
  });
  it('RF12: sem nenhum par completo, o ganho médio fica vazio', () => {
    const vazio = calcularMetricas({ participantes: 3, testes: [], respostas: [], perguntas: PERGUNTAS_DIAGNOSTICAS });
    expect(vazio).toMatchObject({ nPares: 0, ganhoMedio: null });
  });
  it('RF12: uma linha por pergunta respondida, ordenada e sem nome nem e-mail', () => {
    const linhas = linhasDeExportacao(banco.testes, banco.respostasTeste, PERGUNTAS_DIAGNOSTICAS);
    expect(Object.keys(linhas[0])).toEqual(['idPseudonimizado', 'tipoTeste', 'forma', 'versao', 'data', 'pergunta', 'respostaMarcada', 'acerto', 'notaTotal']);
    expect(linhas.length).toBe((12 + 5) * 3);
    const alex = linhas.filter((l) => l.idPseudonimizado === 'P-3C9E');
    expect(alex.map((l) => l.pergunta)).toEqual([1, 2, 3]);
    expect(JSON.stringify(linhas)).not.toMatch(/@|Alex|Bruna/);
  });
});
