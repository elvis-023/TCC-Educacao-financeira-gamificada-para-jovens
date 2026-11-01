import type { LinhaExportacao } from '@/dados/tipos';

/**
 * Análise do protocolo do estudo (artigo, seção 3.3): Wilcoxon de postos sinalizados unilateral (H1: mediana de pós − pré > 0),
 * tamanho de efeito r = Z/√N, mediana e intervalo interquartil por momento e McNemar por pergunta.
 * Sem grupo de controle, o resultado é "ganho observado" e não efeito do aplicativo.
 */

export const ALFA = 0.05;
/** Acima disto usa a aproximação normal; até aqui, a distribuição exata. */
const LIMITE_EXATO = 60;

/** Função de distribuição normal padrão (Abramowitz e Stegun 7.1.26, erro < 1,5e-7). */
export function normalAcumulada(z: number): number {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

/** Percentil com interpolação linear (mesmo método padrão do R, tipo 7). */
export function percentil(valores: number[], p: number): number {
  const v = [...valores].sort((a, b) => a - b);
  const posicao = (v.length - 1) * p;
  const baixo = Math.floor(posicao);
  const alto = Math.ceil(posicao);
  return v[baixo] + (v[alto] - v[baixo]) * (posicao - baixo);
}

export interface Resumo { mediana: number; q1: number; q3: number }
export const resumir = (valores: number[]): Resumo => ({ mediana: percentil(valores, 0.5), q1: percentil(valores, 0.25), q3: percentil(valores, 0.75) });

/** Postos de 1 a n; empates recebem a média dos postos. */
export function postos(valores: number[]): number[] {
  const ordem = valores.map((valor, indice) => ({ valor, indice })).sort((a, b) => a.valor - b.valor);
  const resultado = new Array<number>(valores.length);
  for (let i = 0; i < ordem.length; ) {
    let j = i;
    while (j + 1 < ordem.length && ordem[j + 1].valor === ordem[i].valor) j += 1;
    const medio = (i + j) / 2 + 1;
    for (let k = i; k <= j; k += 1) resultado[ordem[k].indice] = medio;
    i = j + 1;
  }
  return resultado;
}

export interface ResultadoWilcoxon {
  nPares: number;
  /** Pares com diferença diferente de zero (os únicos que entram no teste). */
  nEfetivo: number;
  wMais: number;
  z: number;
  /** r = Z/√N, com N = número de pares (inclui os empates com diferença zero). */
  r: number;
  /** P(W+ ≥ observado) sob H0, unilateral. */
  pUnilateral: number;
  metodo: 'exato' | 'normal';
  significativo: boolean;
}

/** Wilcoxon de postos sinalizados para diferenças pós − pré. Devolve null se todas as diferenças forem zero. */
export function wilcoxonPostosSinalizados(diferencas: number[]): ResultadoWilcoxon | null {
  const nPares = diferencas.length;
  const validas = diferencas.filter((d) => d !== 0);
  const n = validas.length;
  if (n === 0) return null;
  const p = postos(validas.map(Math.abs));
  const wMais = validas.reduce((soma, d, i) => soma + (d > 0 ? p[i] : 0), 0);

  const media = (n * (n + 1)) / 4;
  const empates = new Map<number, number>();
  for (const posto of p) empates.set(posto, (empates.get(posto) ?? 0) + 1);
  const correcao = [...empates.values()].reduce((soma, t) => soma + (t ** 3 - t), 0) / 48;
  const variancia = (n * (n + 1) * (2 * n + 1)) / 24 - correcao;
  const z = variancia > 0 ? (wMais - media) / Math.sqrt(variancia) : 0;

  let pUnilateral: number;
  let metodo: ResultadoWilcoxon['metodo'];
  if (n <= LIMITE_EXATO) {
    // Distribuição exata de W+: cada posto (dobrado, para ficar inteiro) entra ou não na soma.
    const dobrados = p.map((posto) => Math.round(posto * 2));
    const total = dobrados.reduce((soma, x) => soma + x, 0);
    let contagem = new Float64Array(total + 1);
    contagem[0] = 1;
    for (const x of dobrados) {
      const proxima = new Float64Array(total + 1);
      for (let s = 0; s <= total; s += 1) if (contagem[s]) { proxima[s] += contagem[s]; proxima[s + x] += contagem[s]; }
      contagem = proxima;
    }
    const alvo = Math.round(wMais * 2);
    let favoravel = 0;
    for (let s = alvo; s <= total; s += 1) favoravel += contagem[s];
    pUnilateral = favoravel / 2 ** n;
    metodo = 'exato';
  } else {
    pUnilateral = 1 - normalAcumulada((wMais - media - 0.5) / Math.sqrt(variancia));
    metodo = 'normal';
  }
  return { nPares, nEfetivo: n, wMais, z, r: z / Math.sqrt(nPares), pUnilateral, metodo, significativo: pUnilateral < ALFA };
}

export interface ResultadoMcNemar {
  /** Errou no pré e acertou no pós (ganho). */
  ganhou: number;
  /** Acertou no pré e errou no pós (perda). */
  perdeu: number;
  ambosAcertaram: number;
  ambosErraram: number;
  /** Teste exato (binomial, p = 0,5) sobre os pares discordantes; H1: ganhou > perdeu. */
  pUnilateral: number;
  pBilateral: number;
}

const combinacoes = (n: number, k: number) => {
  let resultado = 1;
  for (let i = 1; i <= k; i += 1) resultado = (resultado * (n - k + i)) / i;
  return resultado;
};

/** McNemar exato para uma pergunta, a partir dos pares (acertou no pré, acertou no pós). */
export function mcnemarExato(pares: { pre: boolean; pos: boolean }[]): ResultadoMcNemar {
  const ganhou = pares.filter((p) => !p.pre && p.pos).length;
  const perdeu = pares.filter((p) => p.pre && !p.pos).length;
  const discordantes = ganhou + perdeu;
  const cauda = (a: number) => {
    let soma = 0;
    for (let k = a; k <= discordantes; k += 1) soma += combinacoes(discordantes, k);
    return soma / 2 ** discordantes;
  };
  const pUnilateral = discordantes === 0 ? 1 : cauda(ganhou);
  const pBilateral = discordantes === 0 ? 1 : Math.min(1, 2 * cauda(Math.max(ganhou, perdeu)));
  return {
    ganhou, perdeu, ambosAcertaram: pares.filter((p) => p.pre && p.pos).length, ambosErraram: pares.filter((p) => !p.pre && !p.pos).length,
    pUnilateral, pBilateral,
  };
}

export interface AnalisePrePos {
  nPares: number;
  pre: Resumo;
  pos: Resumo;
  wilcoxon: ResultadoWilcoxon | null;
  porPergunta: ({ pergunta: number } & ResultadoMcNemar)[];
}

/** Monta a análise a partir das linhas do CSV de exportação (RF12): só quem tem pré e pós entra. Devolve null sem pares. */
export function analisarPrePos(linhas: LinhaExportacao[]): AnalisePrePos | null {
  const porPessoa = new Map<string, { pre?: LinhaExportacao[]; pos?: LinhaExportacao[] }>();
  for (const linha of linhas) {
    const pessoa = porPessoa.get(linha.idPseudonimizado) ?? {};
    (pessoa[linha.tipoTeste] ??= []).push(linha);
    porPessoa.set(linha.idPseudonimizado, pessoa);
  }
  const pares = [...porPessoa.values()].filter((p): p is { pre: LinhaExportacao[]; pos: LinhaExportacao[] } => Boolean(p.pre && p.pos));
  if (pares.length === 0) return null;
  const notasPre = pares.map((p) => p.pre[0].notaTotal);
  const notasPos = pares.map((p) => p.pos[0].notaTotal);
  const perguntas = [...new Set(linhas.map((l) => l.pergunta))].sort((a, b) => a - b);
  return {
    nPares: pares.length,
    pre: resumir(notasPre),
    pos: resumir(notasPos),
    wilcoxon: wilcoxonPostosSinalizados(notasPos.map((pos, i) => pos - notasPre[i])),
    porPergunta: perguntas.map((numero) => ({
      pergunta: numero,
      ...mcnemarExato(pares.map((p) => ({
        pre: p.pre.some((l) => l.pergunta === numero && l.acerto === 1),
        pos: p.pos.some((l) => l.pergunta === numero && l.acerto === 1),
      }))),
    })),
  };
}
