import type { Nivel, RespostaQuiz } from '@/dados/tipos';

export const porData = (a: { respondidaEm: string }, b: { respondidaEm: string }) => a.respondidaEm.localeCompare(b.respondidaEm);

/** RN02: o nível atual é o da última resposta na trilha; toda trilha começa no Médio. */
export function nivelAtualDaTrilha(respostasDaTrilha: RespostaQuiz[]): Nivel {
  const ordenadas = [...respostasDaTrilha].sort(porData);
  return ordenadas.at(-1)?.nivelTrilhaApos ?? 'medio';
}

export const NIVEIS: Nivel[] = ['facil', 'medio', 'dificil'];

export interface ParametrosMotor { janela: number; limiarSubida: number; limiarDescida: number } // limiares de 0 a 100
/** Valores iniciais de parametros_sistema (RF11). Em execução, o app lê os parâmetros do administrador a cada resposta. */
export const PARAMETROS_MOTOR_PADRAO: ParametrosMotor = { janela: 5, limiarSubida: 80, limiarDescida: 40 };

/**
 * RN02: nível depois de uma resposta. `acertosDaTrilha` em ordem cronológica, já com a resposta nova.
 * Janela deslizante sobre as últimas N respostas da trilha; com menos de N, o nível não muda.
 */
export function proximoNivel(nivelAtual: Nivel, acertosDaTrilha: boolean[], p: ParametrosMotor): Nivel {
  if (acertosDaTrilha.length < p.janela) return nivelAtual;
  const janela = acertosDaTrilha.slice(-p.janela);
  const taxa = (janela.filter(Boolean).length / p.janela) * 100;
  const i = NIVEIS.indexOf(nivelAtual);
  if (taxa >= p.limiarSubida) return NIVEIS[Math.min(i + 1, NIVEIS.length - 1)];
  if (taxa <= p.limiarDescida) return NIVEIS[Math.max(i - 1, 0)];
  return nivelAtual;
}

/** Ordem de busca do "nível mais próximo"; no empate, o mais fácil (decisão 2). */
export const ORDEM_DE_BUSCA: Record<Nivel, Nivel[]> = {
  facil: ['facil', 'medio', 'dificil'],
  medio: ['medio', 'facil', 'dificil'],
  dificil: ['dificil', 'medio', 'facil'],
};

export interface CandidataQuestao { id: string; licaoOrdem: number; nivel: Nivel; ativa: boolean }
export interface EntradaSelecao {
  nivelAtual: Nivel;
  licaoAtualOrdem: number;
  questoesDaTrilha: CandidataQuestao[];
  respondidasPeloJovem: { questaoId: string; respondidaEm: string }[]; // na trilha, em qualquer quiz
  respondidasNesteQuiz: string[];
}

/**
 * RN02 e decisão 9: grupo de onde a próxima questão é sorteada. Candidatas: ativas, da lição atual ou anteriores,
 * nunca respondidas. Preferência: nível atual e, nele, a lição atual; depois o nível mais próximo.
 * Caso extremo: a respondida há mais tempo, fora deste quiz.
 */
export function grupoPreferido(e: EntradaSelecao): string[] {
  const respondidas = new Set(e.respondidasPeloJovem.map((r) => r.questaoId));
  const permitidas = e.questoesDaTrilha.filter((q) => q.ativa && q.licaoOrdem <= e.licaoAtualOrdem && !e.respondidasNesteQuiz.includes(q.id));
  const candidatas = permitidas.filter((q) => !respondidas.has(q.id));
  for (const nivel of ORDEM_DE_BUSCA[e.nivelAtual]) {
    const doNivel = candidatas.filter((q) => q.nivel === nivel);
    if (doNivel.length === 0) continue;
    const daLicaoAtual = doNivel.filter((q) => q.licaoOrdem === e.licaoAtualOrdem);
    return (daLicaoAtual.length > 0 ? daLicaoAtual : doNivel).map((q) => q.id);
  }
  const ultimaVez = new Map<string, string>();
  for (const r of e.respondidasPeloJovem) {
    const anterior = ultimaVez.get(r.questaoId);
    if (!anterior || r.respondidaEm > anterior) ultimaVez.set(r.questaoId, r.respondidaEm);
  }
  const maisAntiga = permitidas
    .filter((q) => ultimaVez.has(q.id))
    .sort((a, b) => ultimaVez.get(a.id)!.localeCompare(ultimaVez.get(b.id)!))[0];
  return maisAntiga ? [maisAntiga.id] : [];
}

export function selecionarProximaQuestao(e: EntradaSelecao & { aleatorio: () => number }): string | null {
  const grupo = grupoPreferido(e);
  return grupo.length > 0 ? grupo[Math.floor(e.aleatorio() * grupo.length)] : null;
}
