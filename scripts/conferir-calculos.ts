import { readFileSync, writeFileSync } from 'node:fs';
import type { EntradaFatura, EntradaJuros } from '../src/dados/tipos';
import { simularFatura, simularJuros } from '../src/regras/simuladores';

/**
 * RNF01: compara os simuladores do app com os casos calculados de forma independente (scripts/conferencia/gerar_casos.py).
 * A divergência é medida em reais e deve ficar abaixo de meio centavo (a exibição arredonda para 2 casas).
 */
const pasta = new URL('../docs/conferencia/', import.meta.url);
const casos = JSON.parse(readFileSync(new URL('casos.json', pasta), 'utf-8')) as {
  juros: (EntradaJuros & { esperado: string })[];
  fatura: (EntradaFatura & { esperado: Record<string, string | boolean> })[];
};

const juros = casos.juros.map((c) => ({ ...c, app: simularJuros(c).montante }));
const fatura = casos.fatura.map((c) => {
  const r = simularFatura(c);
  return { ...c, app: { parcela: r.pagandoMinimo.parcela, somaParcelas: r.pagandoMinimo.somaParcelas, juros: r.pagandoMinimo.juros, totalPago: r.pagandoMinimo.totalPago, tetoAplicado: r.tetoAplicado } };
});

const divergenciaJuros = juros.map((c) => Math.abs(c.app - Number(c.esperado)));
const campos = ['parcela', 'somaParcelas', 'juros', 'totalPago'] as const;
const divergenciaFatura = fatura.flatMap((c) => campos.map((k) => Math.abs(c.app[k] - Number(c.esperado[k]))));
const maximo = (v: number[]) => v.reduce((a, b) => Math.max(a, b), 0);
const tetoDiferente = fatura.filter((c) => c.app.tetoAplicado !== c.esperado.tetoAplicado).length;
const arredondadoDiferente = juros.filter((c) => c.app.toFixed(2) !== Number(c.esperado).toFixed(2)).length;

const resumo = {
  casosJuros: juros.length,
  casosFatura: fatura.length,
  divergenciaMaximaJurosReais: maximo(divergenciaJuros),
  divergenciaMaximaFaturaReais: maximo(divergenciaFatura),
  casosComTetoDiferente: tetoDiferente,
  casosDeJurosComCentavosDiferentes: arredondadoDiferente,
};
writeFileSync(new URL('resultados.json', pasta), JSON.stringify({ resumo, juros, fatura }, null, 1));
console.log(resumo);
if (resumo.divergenciaMaximaJurosReais >= 0.005 || resumo.divergenciaMaximaFaturaReais >= 0.005 || tetoDiferente > 0) process.exitCode = 1;
