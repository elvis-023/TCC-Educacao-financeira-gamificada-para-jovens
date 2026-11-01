import type { Licao, Progresso, ProgressoTrilha, RespostaQuiz, StatusTrilha, Trilha } from '@/dados/tipos';
import { nivelAtualDaTrilha, porData } from './motorAdaptativo';

export type EstadoLicao = 'concluida' | 'quiz_pendente' | 'disponivel' | 'bloqueada';

/** RF02: a lição seguinte só abre depois do quiz da anterior. */
export function estadoDaLicao(licao: Licao, licoesDaTrilha: Licao[], progressos: Progresso[]): EstadoLicao {
  const daLicao = (id: string) => progressos.find((p) => p.licaoId === id);
  const atual = daLicao(licao.id);
  if (atual?.quizConcluidoEm) return 'concluida';
  if (atual?.leituraConcluidaEm) return 'quiz_pendente';
  if (licao.ordem === 1) return 'disponivel';
  const anterior = licoesDaTrilha.find((l) => l.ordem === licao.ordem - 1);
  return anterior && daLicao(anterior.id)?.quizConcluidoEm ? 'disponivel' : 'bloqueada';
}

export function calcularProgressoTrilha(trilhaId: string, progressos: Progresso[], respostas: RespostaQuiz[], janela: number): ProgressoTrilha {
  const daTrilha = progressos.filter((p) => p.trilhaId === trilhaId);
  const respostasDaTrilha = respostas.filter((r) => r.trilhaId === trilhaId).sort(porData);
  const licoesConcluidas = daTrilha.filter((p) => p.quizConcluidoEm).length;
  const iniciada = daTrilha.some((p) => p.leituraConcluidaEm || p.quizConcluidoEm);
  const status: StatusTrilha = licoesConcluidas >= 3 ? 'concluida' : iniciada ? 'em_andamento' : 'nao_iniciada';
  const ultimas = respostasDaTrilha.slice(-janela);
  const datas = [...daTrilha.flatMap((p) => [p.leituraConcluidaEm, p.quizConcluidoEm]), ...respostasDaTrilha.map((r) => r.respondidaEm)]
    .filter((d): d is string => Boolean(d))
    .sort();
  return {
    trilhaId,
    licoesConcluidas,
    status,
    nivelAtual: nivelAtualDaTrilha(respostasDaTrilha),
    taxaAcertos: ultimas.length ? (ultimas.filter((r) => r.acertou).length / ultimas.length) * 100 : null,
    dataUltimoAcesso: datas.at(-1) ?? null,
  };
}

/** Quantas trilhas têm os 3 quizzes concluídos. */
export function trilhasConcluidas(progressos: Progresso[]): number {
  const concluidosPorTrilha = new Map<string, number>();
  for (const p of progressos) if (p.quizConcluidoEm) concluidosPorTrilha.set(p.trilhaId, (concluidosPorTrilha.get(p.trilhaId) ?? 0) + 1);
  return [...concluidosPorTrilha.values()].filter((n) => n >= 3).length;
}

export type Continuacao =
  | { tipo: 'continuar'; trilha: Trilha; licao: Licao; acao: 'ler' | 'quiz' }
  | { tipo: 'comecar'; trilha: Trilha; licao: Licao }
  | { tipo: 'todas_concluidas' };

/** Card "Continuar de onde parei" (PRD T07). */
export function continuarDeOndeParei(trilhas: Trilha[], licoes: Licao[], progressos: Progresso[], respostas: RespostaQuiz[]): Continuacao {
  const comProgresso = trilhas.map((t) => ({ trilha: t, p: calcularProgressoTrilha(t.id, progressos, respostas, 5) }));
  const emAndamento = comProgresso
    .filter((x) => x.p.status === 'em_andamento')
    .sort((a, b) => (b.p.dataUltimoAcesso ?? '').localeCompare(a.p.dataUltimoAcesso ?? ''));
  if (emAndamento.length > 0) {
    const trilha = emAndamento[0].trilha;
    const daTrilha = licoes.filter((l) => l.trilhaId === trilha.id).sort((a, b) => a.ordem - b.ordem);
    const licao = daTrilha.find((l) => !progressos.find((p) => p.licaoId === l.id)?.quizConcluidoEm)!;
    const leu = Boolean(progressos.find((p) => p.licaoId === licao.id)?.leituraConcluidaEm);
    return { tipo: 'continuar', trilha, licao, acao: leu ? 'quiz' : 'ler' };
  }
  const naoIniciada = comProgresso.filter((x) => x.p.status === 'nao_iniciada').sort((a, b) => a.trilha.ordem - b.trilha.ordem)[0];
  if (naoIniciada) {
    const licao = licoes.find((l) => l.trilhaId === naoIniciada.trilha.id && l.ordem === 1)!;
    return { tipo: 'comecar', trilha: naoIniciada.trilha, licao };
  }
  return { tipo: 'todas_concluidas' };
}
