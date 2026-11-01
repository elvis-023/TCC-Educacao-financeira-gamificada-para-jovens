import { describe, expect, it } from 'vitest';
import type { LinhaExportacao } from '@/dados/tipos';
import { analisarPrePos, mcnemarExato, normalAcumulada, percentil, postos, wilcoxonPostosSinalizados } from './estatistica';

/** Referência independente: enumera todos os 2^n sinais possíveis e conta quantos dão W+ ≥ observado. */
function pExatoPorForcaBruta(diferencas: number[]): number {
  const validas = diferencas.filter((d) => d !== 0);
  const p = postos(validas.map(Math.abs));
  const observado = validas.reduce((s, d, i) => s + (d > 0 ? p[i] : 0), 0);
  let favoraveis = 0;
  for (let mascara = 0; mascara < 2 ** validas.length; mascara += 1) {
    let w = 0;
    for (let i = 0; i < validas.length; i += 1) if (mascara & (1 << i)) w += p[i];
    if (w >= observado - 1e-9) favoraveis += 1;
  }
  return favoraveis / 2 ** validas.length;
}

describe('estatística do protocolo (artigo, seção 3.3)', () => {
  it('normal acumulada confere com valores conhecidos', () => {
    expect(normalAcumulada(0)).toBeCloseTo(0.5, 6);
    expect(normalAcumulada(1.96)).toBeCloseTo(0.975, 4);
    expect(normalAcumulada(-1.645)).toBeCloseTo(0.05, 3);
  });

  it('percentil usa interpolação linear (tipo 7, como o R)', () => {
    expect(percentil([1, 2, 3, 4], 0.25)).toBe(1.75);
    expect(percentil([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(percentil([3], 0.75)).toBe(3);
  });

  it('postos: empates recebem a média dos postos', () => {
    expect(postos([10, 20, 20, 30])).toEqual([1, 2.5, 2.5, 4]);
  });

  it('Wilcoxon: exemplo clássico de Hollander e Wolfe (V = 40, p = 5/256 = 0,01953, igual ao R)', () => {
    const x = [1.83, 0.5, 1.62, 2.48, 1.68, 1.88, 1.55, 3.06, 1.3];
    const y = [0.878, 0.647, 0.598, 2.05, 1.06, 1.29, 1.06, 3.14, 1.29];
    const r = wilcoxonPostosSinalizados(x.map((v, i) => v - y[i]))!;
    expect(r.wMais).toBe(40);
    expect(r.pUnilateral).toBeCloseTo(5 / 256, 10);
    expect(r.metodo).toBe('exato');
    expect(r.significativo).toBe(true);
    expect(r.nEfetivo).toBe(9);
  });

  it('Wilcoxon com empates e diferenças zero bate com a enumeração de todos os sinais', () => {
    // notas de 0 a 3: muitos empates e zeros, como no estudo (artigo, 3.3)
    const diferencas = [1, 1, 0, 2, 1, 0, -1, 1, 2, 0, 1, 1, -2, 1];
    const r = wilcoxonPostosSinalizados(diferencas)!;
    expect(r.nPares).toBe(14);
    expect(r.nEfetivo).toBe(11);
    expect(r.pUnilateral).toBeCloseTo(pExatoPorForcaBruta(diferencas), 12);
  });

  it('Wilcoxon: ganho nenhum não é significativo e tudo zero devolve null', () => {
    expect(wilcoxonPostosSinalizados([0, 0, 0])).toBeNull();
    const r = wilcoxonPostosSinalizados([1, -1, 2, -2, 1, -1])!;
    expect(r.significativo).toBe(false);
    expect(r.z).toBeCloseTo(0, 6);
  });

  it('tamanho de efeito r = Z/√N, com N = número de pares (inclui os zeros)', () => {
    const r = wilcoxonPostosSinalizados([1, 1, 1, 1, 1, 1, 0, 0])!;
    expect(r.nPares).toBe(8);
    expect(r.r).toBeCloseTo(r.z / Math.sqrt(8), 12);
    expect(r.r).toBeGreaterThan(0);
  });

  it('com mais de 60 pares usa a aproximação normal', () => {
    const r = wilcoxonPostosSinalizados(Array.from({ length: 70 }, () => 1))!;
    expect(r.metodo).toBe('normal');
    expect(r.pUnilateral).toBeLessThan(1e-6);
  });

  it('McNemar exato: 10 ganharam e 2 perderam → p unilateral = 79/4096', () => {
    const pares = [
      ...Array.from({ length: 10 }, () => ({ pre: false, pos: true })),
      ...Array.from({ length: 2 }, () => ({ pre: true, pos: false })),
      ...Array.from({ length: 3 }, () => ({ pre: true, pos: true })),
      ...Array.from({ length: 4 }, () => ({ pre: false, pos: false })),
    ];
    const r = mcnemarExato(pares);
    expect(r).toMatchObject({ ganhou: 10, perdeu: 2, ambosAcertaram: 3, ambosErraram: 4 });
    expect(r.pUnilateral).toBeCloseTo(79 / 4096, 12);
    expect(r.pBilateral).toBeCloseTo(158 / 4096, 12);
  });

  it('McNemar sem pares discordantes: p = 1', () => {
    expect(mcnemarExato([{ pre: true, pos: true }, { pre: false, pos: false }]).pUnilateral).toBe(1);
  });

  describe('análise a partir das linhas do CSV (RF12)', () => {
    const linha = (id: string, tipo: 'pre' | 'pos', pergunta: number, acerto: 0 | 1, nota: number): LinhaExportacao => ({
      idPseudonimizado: id, tipoTeste: tipo, forma: tipo === 'pre' ? 'A' : 'B', versao: '1', data: '01/11/2026',
      pergunta, respostaMarcada: 'x', acerto, notaTotal: nota,
    });
    const pessoa = (id: string, pre: [0 | 1, 0 | 1, 0 | 1], pos: [0 | 1, 0 | 1, 0 | 1]) => [
      ...pre.map((a, i) => linha(id, 'pre', i + 1, a, pre.reduce<number>((s, x) => s + x, 0))),
      ...pos.map((a, i) => linha(id, 'pos', i + 1, a, pos.reduce<number>((s, x) => s + x, 0))),
    ];

    it('sem ninguém com os dois testes, não há análise', () => {
      expect(analisarPrePos([...pessoa('a', [1, 0, 0], [1, 1, 0]).filter((l) => l.tipoTeste === 'pre')])).toBeNull();
    });

    it('só entram os pares; calcula mediana, IIQ, Wilcoxon e McNemar por pergunta', () => {
      const linhas = [
        ...pessoa('p1', [1, 0, 0], [1, 1, 1]),
        ...pessoa('p2', [0, 0, 1], [1, 0, 1]),
        ...pessoa('p3', [1, 1, 0], [1, 1, 0]),
        ...pessoa('p4', [0, 0, 0], [1, 1, 0]),
        ...pessoa('so-pre', [1, 1, 1], [1, 1, 1]).filter((l) => l.tipoTeste === 'pre'),
      ];
      const a = analisarPrePos(linhas)!;
      expect(a.nPares).toBe(4);
      expect(a.pre.mediana).toBe(1); // notas pré: 1, 1, 2, 0 → mediana 1
      expect(a.pos.mediana).toBe(2); // notas pós: 3, 2, 2, 2 → mediana 2
      expect(a.wilcoxon?.nEfetivo).toBe(3);
      expect(a.porPergunta).toHaveLength(3);
      expect(a.porPergunta[0]).toMatchObject({ pergunta: 1, ganhou: 2, perdeu: 0 });
    });
  });
});
