import type { RepositorioConquistas } from '../contratos';
import { cliente, iso, traduzirErro } from './comum';

// A concessão acontece no servidor, ao concluir o quiz (função `conceder_conquistas`); aqui só se lê.
export const conquistasSupabase: RepositorioConquistas = {
  async minhasConquistas() {
    const { data, error } = await cliente().from('usuario_badges').select('usuario_id, badge_id, conquistado_em');
    if (error) throw new Error(traduzirErro(error));
    return (data ?? []).map((l) => ({ usuarioId: l.usuario_id, badgeId: l.badge_id, conquistadoEm: iso(l.conquistado_em)! }));
  },
};
