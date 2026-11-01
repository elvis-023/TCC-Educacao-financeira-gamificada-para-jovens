import { describe, expect, it } from 'vitest';
import { LICOES } from '../trilhas';

describe('conteúdo das lições (PRD 2.4 e 6.5)', () => {
  it.each(LICOES.map((l) => [l.id, l] as const))('%s tem texto, 1 exemplo, 1 resumo e tempo de 3 a 5 min', (_id, licao) => {
    const tipos = licao.conteudo.map((b) => b.tipo);
    expect(tipos.filter((t) => t === 'texto').length).toBeGreaterThanOrEqual(3);
    expect(tipos.filter((t) => t === 'exemplo')).toHaveLength(1);
    expect(tipos.filter((t) => t === 'resumo')).toHaveLength(1);
    const resumo = licao.conteudo.find((b) => b.tipo === 'resumo');
    expect(resumo && resumo.tipo === 'resumo' && resumo.itens.length).toBeGreaterThanOrEqual(3);
    expect(licao.tempoLeituraMin).toBeGreaterThanOrEqual(3);
    expect(licao.tempoLeituraMin).toBeLessThanOrEqual(5);
  });
});
