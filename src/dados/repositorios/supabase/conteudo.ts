import type { RepositorioConteudo } from '../contratos';
import { cliente, traduzirErro } from './comum';
import { paraLicao } from './mapear';

async function ler<T>(consulta: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await consulta;
  if (error) throw new Error(traduzirErro(error));
  return data ?? ([] as unknown as T);
}

/* eslint-disable @typescript-eslint/no-explicit-any -- linhas cruas do PostgREST */
export const conteudoSupabase: RepositorioConteudo = {
  async listarTrilhas() {
    const linhas = await ler<any[]>(cliente().from('trilhas').select('*').order('ordem'));
    return linhas.map((t) => ({ id: t.id, slug: t.slug, titulo: t.titulo, descricao: t.descricao, categoria: t.categoria, ordem: t.ordem }));
  },
  async listarLicoes() {
    const linhas = await ler<any[]>(cliente().from('licoes').select('*').order('trilha_id').order('ordem'));
    return linhas.map(paraLicao);
  },
  async listarQuizzes() {
    const linhas = await ler<any[]>(cliente().from('quizzes').select('*').order('id'));
    return linhas.map((q) => ({ id: q.id, licaoId: q.licao_id, tipoAvaliacao: 'adaptativo' as const, numeroQuestoes: q.numero_questoes }));
  },
  async listarBadges() {
    const linhas = await ler<any[]>(cliente().from('badges').select('*').order('ordem'));
    return linhas.map((b) => ({ id: b.id, nome: b.nome, criterioMarco: b.criterio_marco, icone: b.icone, ordem: b.ordem }));
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */
