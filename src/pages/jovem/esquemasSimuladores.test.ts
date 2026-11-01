import { describe, expect, it } from 'vitest';
import { esquemaFatura, esquemaJuros } from './esquemasSimuladores';

/** Primeira mensagem de cada campo, como o formulário mostra. */
function mensagens(r: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  const porCampo: Record<string, string> = {};
  for (const issue of r.error?.issues ?? []) {
    const campo = String(issue.path[0]);
    if (!(campo in porCampo)) porCampo[campo] = issue.message;
  }
  return porCampo;
}

const jurosValido = { valorInicial: 1000, aporteMensal: 100, taxa: '1,00', unidadeTaxa: 'mes', prazo: '12', unidadePrazo: 'meses' };

describe('validação dos simuladores', () => {
  it('juros: aceita o caso de aceite', () => {
    expect(esquemaJuros.safeParse(jurosValido).success).toBe(true);
  });
  it('juros: campos vazios, negativos e prazo menor que 1 mês bloqueiam', () => {
    expect(mensagens(esquemaJuros.safeParse({ ...jurosValido, valorInicial: null }))).toMatchObject({ valorInicial: 'Informe o valor inicial' });
    expect(mensagens(esquemaJuros.safeParse({ ...jurosValido, aporteMensal: -1 }))).toMatchObject({ aporteMensal: 'O valor não pode ser negativo' });
    expect(mensagens(esquemaJuros.safeParse({ ...jurosValido, taxa: '' }))).toMatchObject({ taxa: 'Informe a taxa de juros' });
    expect(mensagens(esquemaJuros.safeParse({ ...jurosValido, taxa: '-2' }))).toMatchObject({ taxa: 'A taxa não pode ser negativa' });
    expect(mensagens(esquemaJuros.safeParse({ ...jurosValido, prazo: '0' }))).toMatchObject({ prazo: 'O prazo mínimo é de 1 mês' });
    expect(mensagens(esquemaJuros.safeParse({ ...jurosValido, valorInicial: 0, aporteMensal: 0 }))).toMatchObject({ valorInicial: 'Informe um valor inicial ou um aporte maior que zero' });
  });
  it('fatura: mínimo maior ou igual à fatura bloqueia com o aviso do rotativo', () => {
    const r = esquemaFatura.safeParse({ valorFatura: 1000, pagamentoMinimo: 1000, taxaRotativo: '15', taxaParcelamento: '9', parcelas: 12 });
    expect(mensagens(r)).toMatchObject({ pagamentoMinimo: 'Com esse pagamento não sobra saldo para o rotativo: não há incidência de juros do rotativo.' });
  });
  it('fatura: parcelas fora de 2 a 24 bloqueiam', () => {
    const r = esquemaFatura.safeParse({ valorFatura: 1000, pagamentoMinimo: 150, taxaRotativo: '15', taxaParcelamento: '9', parcelas: 30 });
    expect(mensagens(r)).toMatchObject({ parcelas: 'Escolha de 2 a 24 parcelas' });
  });
});
