import type { FormaTeste, LinhaExportacao, MetricasPesquisa, PerguntaDiagnostica, RespostaTeste, TesteDiagnostico, TipoTeste } from '@/dados/tipos';
import { formatarData } from '@/lib/formatacao';

export const TOTAL_PERGUNTAS = 3;

export const formaDoTeste = (tipo: TipoTeste): FormaTeste => (tipo === 'pre' ? 'A' : 'B');
export const percentualDeAcerto = (nota: number, totalPerguntas: number) => (nota / totalPerguntas) * 100;
/** Diferença pós − pré, em pontos percentuais. */
export const diferencaPp = (notaPre: number, notaPos: number, totalPerguntas: number) =>
  percentualDeAcerto(notaPos, totalPerguntas) - percentualDeAcerto(notaPre, totalPerguntas);

/** RF12: métricas da visão geral. O ganho observado só conta quem fez os dois testes (sem grupo de controle). */
export function calcularMetricas(e: { participantes: number; testes: TesteDiagnostico[]; respostas: RespostaTeste[]; perguntas: PerguntaDiagnostica[] }): MetricasPesquisa {
  const concluidos = e.testes.filter((t) => t.concluidoEm);
  const pre = new Map(concluidos.filter((t) => t.tipoTeste === 'pre').map((t) => [t.pseudonimo, t]));
  const pos = new Map(concluidos.filter((t) => t.tipoTeste === 'pos').map((t) => [t.pseudonimo, t]));
  const pares = [...pre.keys()].filter((p) => pos.has(p));
  const perguntasPorForma = e.perguntas.filter((p) => p.forma === 'A').length || TOTAL_PERGUNTAS;
  const ganhos = pares.map((p) => diferencaPp(pre.get(p)!.pontuacaoTotal!, pos.get(p)!.pontuacaoTotal!, perguntasPorForma));
  const numeroDaPergunta = new Map(e.perguntas.map((p) => [p.id, p.numero]));
  const tipoDoTeste = new Map(concluidos.map((t) => [t.id, t.tipoTeste]));
  const testesDosPares = new Set(pares.flatMap((p) => [pre.get(p)!.id, pos.get(p)!.id]));
  const porPergunta = [1, 2, 3].map((numero) => {
    const daPergunta = e.respostas.filter((r) => testesDosPares.has(r.testeId) && numeroDaPergunta.get(r.perguntaId) === numero);
    const taxa = (tipo: TipoTeste) => {
      const doTipo = daPergunta.filter((r) => tipoDoTeste.get(r.testeId) === tipo);
      return doTipo.length ? (doTipo.filter((r) => r.acertou).length / doTipo.length) * 100 : 0;
    };
    return { numero, pre: taxa('pre'), pos: taxa('pos') };
  });
  const pseudonimos = [...new Set(concluidos.map((t) => t.pseudonimo))].sort();
  return {
    participantes: e.participantes,
    preConcluidos: pre.size,
    posConcluidos: pos.size,
    nPares: pares.length,
    ganhoMedio: ganhos.length ? ganhos.reduce((soma, g) => soma + g, 0) / ganhos.length : null,
    porPergunta,
    participantesTabela: pseudonimos.map((p) => ({
      pseudonimo: p, preData: pre.get(p)?.concluidoEm ?? null, preNota: pre.get(p)?.pontuacaoTotal ?? null,
      posData: pos.get(p)?.concluidoEm ?? null, posNota: pos.get(p)?.pontuacaoTotal ?? null,
    })),
  };
}

/** RF12 e RNF06: uma linha por pergunta respondida, só com o pseudônimo (sem nome nem e-mail). */
export function linhasDeExportacao(testes: TesteDiagnostico[], respostas: RespostaTeste[], perguntas: PerguntaDiagnostica[]): LinhaExportacao[] {
  const pergunta = new Map(perguntas.map((p) => [p.id, p]));
  const linhas = testes.filter((t) => t.concluidoEm).flatMap((t) =>
    respostas.filter((r) => r.testeId === t.id).map((r): LinhaExportacao => {
      const p = pergunta.get(r.perguntaId)!;
      return {
        idPseudonimizado: t.pseudonimo, tipoTeste: t.tipoTeste, forma: t.forma, versao: t.versao, data: formatarData(r.respondidaEm),
        pergunta: p.numero, respostaMarcada: p.alternativas[r.alternativaMarcada], acerto: r.acertou ? 1 : 0, notaTotal: t.pontuacaoTotal ?? 0,
      };
    }),
  );
  const ordemTipo = { pre: 0, pos: 1 };
  return linhas.sort((a, b) => a.idPseudonimizado.localeCompare(b.idPseudonimizado) || ordemTipo[a.tipoTeste] - ordemTipo[b.tipoTeste] || a.pergunta - b.pergunta);
}
