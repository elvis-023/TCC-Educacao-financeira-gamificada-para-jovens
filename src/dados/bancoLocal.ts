import type {
  Notificacao, ParametroSistema, Progresso, Questao, RespostaQuiz, RespostaTeste, Simulacao, TesteDiagnostico, Usuario, UsuarioBadge,
} from '@/dados/tipos';
import { criarDadosDemo, VERSAO_DADOS } from '@/dados/demo';
import { agora } from '@/lib/relogio';

const CHAVE = 'efg:dados';

export interface BancoDados {
  versao: number;
  usuarios: Usuario[];
  pseudonimos: Record<string, string>; // usuarioId → pseudônimo, separado do usuário (RNF06)
  questoes: Questao[];
  respostasQuiz: RespostaQuiz[];
  progressos: Progresso[];
  simulacoes: Simulacao[];
  usuarioBadges: UsuarioBadge[];
  notificacoes: Notificacao[];
  testes: TesteDiagnostico[];
  respostasTeste: RespostaTeste[];
  parametros: ParametroSistema[];
}

let memoria: BancoDados | null = null;
let armazenamentoDisponivel = true;

function gravar(banco: BancoDados): void {
  memoria = banco;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(banco));
  } catch {
    armazenamentoDisponivel = false;
  }
}

export function carregarBanco(): BancoDados {
  if (memoria) return memoria;
  try {
    const bruto = localStorage.getItem(CHAVE);
    const salvo = bruto ? (JSON.parse(bruto) as BancoDados) : null;
    if (salvo?.versao === VERSAO_DADOS) return (memoria = salvo);
  } catch {
    armazenamentoDisponivel = false;
  }
  const novo = criarDadosDemo(agora());
  gravar(novo);
  return novo;
}

/** Aplica uma alteração e grava. Devolve o que a função devolver. */
export function alterarBanco<T>(alteracao: (banco: BancoDados) => T): T {
  const banco = carregarBanco();
  const resultado = alteracao(banco);
  gravar(banco);
  return resultado;
}

export function reiniciarBanco(): void {
  gravar(criarDadosDemo(agora()));
}

export function armazenamentoOk(): boolean {
  return armazenamentoDisponivel;
}
