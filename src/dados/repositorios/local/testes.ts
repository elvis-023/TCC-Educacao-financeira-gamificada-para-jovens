import { carregarBanco } from '@/dados/bancoLocal';
import type { ResumoTeste } from '@/dados/tipos';
import type { RepositorioTestes } from '../contratos';
import { responder, usuarioDaSessao } from './comum';

export function resumosDoUsuario(usuarioId: string): ResumoTeste[] {
  const banco = carregarBanco();
  const pseudonimo = banco.pseudonimos[usuarioId];
  return banco.testes
    .filter((t) => t.pseudonimo === pseudonimo)
    .map((t) => ({
      tipoTeste: t.tipoTeste, forma: t.forma, versao: t.versao, iniciadoEm: t.iniciadoEm, concluidoEm: t.concluidoEm,
      pontuacaoTotal: t.pontuacaoTotal, respondidas: banco.respostasTeste.filter((r) => r.testeId === t.id).length,
    }));
}

export const testesLocal: RepositorioTestes = {
  meusTestes: () => responder(resumosDoUsuario(usuarioDaSessao())),
};
