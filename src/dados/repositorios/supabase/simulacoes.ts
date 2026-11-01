import type { RepositorioSimulacoes } from '../contratos';
import { cliente, traduzirErro } from './comum';
import { paraSimulacao } from './mapear';

export const simulacoesSupabase: RepositorioSimulacoes = {
  async minhasSimulacoes() {
    const { data, error } = await cliente().from('simulacoes').select('*').order('criada_em', { ascending: false }).limit(10);
    if (error) throw new Error(traduzirErro(error));
    return (data ?? []).map(paraSimulacao);
  },
  async salvar(s) {
    // O usuario_id vem do padrão auth.uid() da coluna.
    const { error } = await cliente().from('simulacoes').insert({
      tipo_simulacao: s.tipoSimulacao, parametros: s.parametros as never, resultado_final: s.resultadoFinal,
    });
    if (error) throw new Error(traduzirErro(error));
  },
};
