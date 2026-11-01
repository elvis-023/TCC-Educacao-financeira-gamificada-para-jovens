import type { RespostaTeste, TesteDiagnostico } from '@/dados/tipos';
import { instanteRelativo } from '@/lib/fuso';
import { PERGUNTAS_DIAGNOSTICAS, VERSAO_TESTE } from './perguntasDiagnosticas';
import { ID_ALEX, JOVENS_FICTICIOS, PSEUDONIMO_ALEX } from './usuarios';

type Marcadas = [number, number, number];
interface Participante { usuarioId: string; pre: { diasAtras: number; marcadas: Marcadas }; pos?: { diasAtras: number; marcadas: Marcadas } }

// Dados FICTÍCIOS, só para mostrar as telas e o CSV. Nunca entram no artigo nem na documentação como resultado.
const PARTICIPANTES: Participante[] = [
  { usuarioId: 'demo-bruna', pre: { diasAtras: 20, marcadas: [0, 2, 0] }, pos: { diasAtras: 2, marcadas: [0, 2, 1] } },  // 2 → 3
  { usuarioId: 'demo-caio', pre: { diasAtras: 19, marcadas: [0, 1, 2] }, pos: { diasAtras: 3, marcadas: [0, 2, 1] } },   // 1 → 3
  { usuarioId: 'demo-duda', pre: { diasAtras: 18, marcadas: [0, 2, 0] }, pos: { diasAtras: 1, marcadas: [0, 2, 0] } },   // 2 → 2
  { usuarioId: 'demo-enzo', pre: { diasAtras: 17, marcadas: [3, 3, 2] }, pos: { diasAtras: 2, marcadas: [0, 0, 1] } },   // 0 → 2
  { usuarioId: 'demo-gabi', pre: { diasAtras: 16, marcadas: [0, 2, 1] }, pos: { diasAtras: 1, marcadas: [0, 1, 1] } },   // 3 → 2
  { usuarioId: 'demo-heitor', pre: { diasAtras: 12, marcadas: [0, 0, 1] } },  // 2
  { usuarioId: ID_ALEX, pre: { diasAtras: 5, marcadas: [0, 1, 2] } },         // 1 (P1 correta, P2 "Exatamente o mesmo", P3 "Não sei")
  { usuarioId: 'demo-iara', pre: { diasAtras: 11, marcadas: [2, 2, 2] } },    // 1
  { usuarioId: 'demo-joao', pre: { diasAtras: 10, marcadas: [0, 2, 1] } },    // 3
  { usuarioId: 'demo-kaua', pre: { diasAtras: 9, marcadas: [3, 3, 2] } },     // 0
  { usuarioId: 'demo-lara', pre: { diasAtras: 8, marcadas: [0, 3, 0] } },     // 1
  { usuarioId: 'demo-mateus', pre: { diasAtras: 7, marcadas: [1, 2, 0] } },   // 1
];

export function criarPesquisa(agora: Date): { pseudonimos: Record<string, string>; testes: TesteDiagnostico[]; respostasTeste: RespostaTeste[] } {
  const pseudonimos: Record<string, string> = { [ID_ALEX]: PSEUDONIMO_ALEX };
  for (const j of JOVENS_FICTICIOS) pseudonimos[j.id] = j.pseudonimo;
  const testes: TesteDiagnostico[] = [];
  const respostasTeste: RespostaTeste[] = [];
  for (const p of PARTICIPANTES) {
    for (const [tipoTeste, dados] of [['pre', p.pre], ['pos', p.pos]] as const) {
      if (!dados) continue;
      const forma = tipoTeste === 'pre' ? 'A' : 'B';
      const perguntas = PERGUNTAS_DIAGNOSTICAS.filter((q) => q.forma === forma);
      const hora = p.usuarioId === ID_ALEX ? 19 : 18;
      const testeId = `demo-teste-${p.usuarioId}-${tipoTeste}`;
      let nota = 0;
      perguntas.forEach((pergunta, i) => {
        const marcada = dados.marcadas[i];
        const acertou = marcada === pergunta.alternativaCorreta;
        nota += acertou ? 1 : 0;
        respostasTeste.push({ id: `${testeId}-${pergunta.numero}`, testeId, perguntaId: pergunta.id, alternativaMarcada: marcada, acertou, respondidaEm: instanteRelativo(agora, dados.diasAtras, hora, 5 + i) });
      });
      testes.push({
        id: testeId, pseudonimo: pseudonimos[p.usuarioId], tipoTeste, forma, versao: VERSAO_TESTE,
        iniciadoEm: instanteRelativo(agora, dados.diasAtras, hora, 4), concluidoEm: instanteRelativo(agora, dados.diasAtras, hora, 8), pontuacaoTotal: nota,
      });
    }
  }
  return { pseudonimos, testes, respostasTeste };
}
