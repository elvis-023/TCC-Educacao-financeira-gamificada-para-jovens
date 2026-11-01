import type { BlocoConteudo } from '@/dados/tipos';

export const conteudo: Record<string, BlocoConteudo[]> = {
  'cartao-de-credito-1': [
    { tipo: 'texto', texto: 'A fatura do cartão reúne as compras de um período e mostra quanto você deve pagar. O limite é o valor máximo que o banco libera para você gastar no cartão.' },
    { tipo: 'texto', texto: 'O fechamento é o dia em que a fatura "vira": compras feitas depois dele entram na fatura seguinte. O vencimento é a data-limite para pagar.' },
    { tipo: 'texto', texto: 'Pagar o valor total até o vencimento evita juros. Nesse caso, o cartão é só uma conveniência, e não um crédito caro.' },
    { tipo: 'texto', texto: 'Antes de comprar no cartão, pergunte-se: "eu consigo pagar a fatura inteira?". Se a resposta for não, a compra pode custar bem mais do que o preço.' },
    { tipo: 'exemplo', titulo: 'Compras de R$ 800,00 até o fechamento', linhas: [
      'Fatura: R$ 800,00.',
      'Pagando R$ 800,00 no vencimento, os juros são R$ 0,00.',
      'Pagando menos, o restante vira dívida com juros (veja a próxima lição).',
    ] },
    { tipo: 'resumo', itens: [
      'A fatura soma as compras do período; o limite é o teto de gastos.',
      'O fechamento define em qual fatura a compra entra.',
      'Pagar o total até o vencimento evita juros.',
    ] },
  ],
  'cartao-de-credito-2': [
    { tipo: 'texto', texto: 'O pagamento mínimo é o menor valor que você pode pagar para manter a fatura em dia. Pagar só o mínimo parece um alívio, mas o que sobrou continua sendo dívida.' },
    { tipo: 'texto', texto: 'O saldo que não foi pago entra no crédito rotativo, uma das modalidades de crédito com juros mais altos do mercado. Pelas regras atuais, o rotativo dura só até a próxima fatura: depois disso, o saldo precisa ser parcelado.' },
    { tipo: 'texto', texto: 'Os juros do rotativo incidem sobre o saldo que ficou em aberto, e a taxa costuma ser de vários por cento ao mês. Em pouco tempo, a dívida cresce bem mais do que a compra original.' },
    { tipo: 'exemplo', titulo: 'Fatura de R$ 1.000,00 e pagamento mínimo de R$ 150,00', linhas: [
      'Saldo que vai para o rotativo: R$ 850,00.',
      'Com juros de 15% ao mês (um valor de exemplo), o saldo vira R$ 977,50 na fatura seguinte.',
      'Foram R$ 127,50 de juros em apenas um mês.',
    ] },
    { tipo: 'resumo', itens: [
      'Pagar só o mínimo deixa o resto da fatura como dívida.',
      'O rotativo tem juros altos e dura só até a próxima fatura.',
      'Sempre que possível, pague o valor total.',
    ] },
  ],
  'cartao-de-credito-3': [
    { tipo: 'texto', texto: 'Depois do rotativo, o saldo da fatura é parcelado em parcelas iguais. No cálculo conhecido como tabela Price, todas as parcelas têm o mesmo valor, e os juros incidem sobre o saldo que ainda falta pagar.' },
    { tipo: 'texto', texto: 'O CET, custo efetivo total, reúne os juros, as tarifas e os impostos de uma operação de crédito. Ao comparar ofertas, olhe o CET, e não só a taxa de juros anunciada.' },
    { tipo: 'texto', texto: 'A lei limita a cobrança: a soma dos juros do rotativo e do parcelamento não pode passar de 100% do valor que ficou em aberto (Lei nº 14.690/2023). Na prática, você nunca paga mais do que o dobro desse valor.' },
    { tipo: 'exemplo', titulo: 'R$ 977,50 em 12 parcelas a 9% ao mês', linhas: [
      'Cada parcela: R$ 136,51.',
      'Total pago nas parcelas: cerca de R$ 1.638,00.',
      'Juros: cerca de R$ 788,00, sobre os R$ 850,00 que ficaram em aberto.',
    ] },
    { tipo: 'resumo', itens: [
      'O saldo do rotativo é parcelado em parcelas iguais (tabela Price).',
      'O CET mostra o custo total de uma operação de crédito.',
      'A lei limita os juros a 100% do valor que ficou em aberto.',
    ] },
  ],
};

export const tempos: Record<string, number> = { 'cartao-de-credito-1': 4, 'cartao-de-credito-2': 4, 'cartao-de-credito-3': 5 };
