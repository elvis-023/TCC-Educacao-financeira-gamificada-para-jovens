import type { BlocoConteudo } from '@/dados/tipos';

export const conteudo: Record<string, BlocoConteudo[]> = {
  'orcamento-pessoal-1': [
    { tipo: 'texto', texto: 'Orçamento é o plano de quanto dinheiro entra e para onde ele vai. O primeiro passo é conhecer a sua renda, que é todo o dinheiro que você recebe no mês: salário, bolsa, trabalhos extras.' },
    { tipo: 'texto', texto: 'Os gastos se dividem em dois grupos. Gastos fixos se repetem com o mesmo valor, como aluguel, internet e mensalidades. Gastos variáveis mudam de mês para mês, como transporte, alimentação fora de casa e lazer.' },
    { tipo: 'texto', texto: 'Para descobrir os seus números, anote cada gasto por um mês, mesmo os pequenos. Pode ser no caderno, numa planilha ou no celular. No fim do mês, some tudo e compare com a sua renda.' },
    { tipo: 'texto', texto: 'Se sobrar dinheiro, ele pode virar reserva ou ajudar numa meta. Se faltar, a anotação mostra onde dá para cortar.' },
    { tipo: 'exemplo', titulo: 'Renda de R$ 1.800,00 em um mês', linhas: [
      'Gastos fixos: R$ 1.050,00.',
      'Gastos variáveis: R$ 600,00.',
      'Total de gastos: R$ 1.650,00.',
      'Sobram R$ 150,00 (R$ 1.800,00 − R$ 1.650,00).',
    ] },
    { tipo: 'resumo', itens: [
      'Renda é tudo o que você recebe no mês.',
      'Gastos fixos se repetem; gastos variáveis mudam.',
      'Anotar os gastos por um mês mostra para onde o dinheiro vai.',
    ] },
  ],
  'orcamento-pessoal-2': [
    { tipo: 'texto', texto: 'Montar o orçamento é decidir, antes de gastar, o que fazer com cada parte da renda. Comece listando as suas metas, como trocar de celular, fazer uma viagem ou formar uma reserva, e ordene por prioridade.' },
    { tipo: 'texto', texto: 'Uma divisão muito usada como ponto de partida é a 50/30/20: 50% da renda para necessidades (moradia, comida, transporte), 30% para desejos (lazer, compras) e 20% para guardar.' },
    { tipo: 'texto', texto: 'Ela é uma sugestão, não uma lei. Se o seu aluguel pesa mais, ajuste os percentuais, mas mantenha sempre uma parte para guardar.' },
    { tipo: 'texto', texto: 'Revise o orçamento todo mês. A vida muda, e o plano precisa acompanhar.' },
    { tipo: 'exemplo', titulo: 'Renda de R$ 2.000,00 na divisão 50/30/20', linhas: [
      'Necessidades (50%): R$ 1.000,00.',
      'Desejos (30%): R$ 600,00.',
      'Guardar (20%): R$ 400,00.',
    ] },
    { tipo: 'resumo', itens: [
      'Defina metas e ordene por prioridade.',
      'A divisão 50/30/20 é um ponto de partida e pode ser ajustada.',
      'Guardar uma parte da renda deve entrar no plano desde o começo.',
      'Revise o orçamento todo mês.',
    ] },
  ],
  'orcamento-pessoal-3': [
    { tipo: 'texto', texto: 'Reserva de emergência é um dinheiro guardado para imprevistos, como um conserto urgente, uma despesa de saúde ou a perda de renda. Ela evita que você precise pegar dinheiro emprestado, com juros altos, na hora do aperto.' },
    { tipo: 'texto', texto: 'Uma meta comum é guardar de 3 a 6 meses dos seus gastos essenciais, que são os de que você não abre mão: moradia, comida, transporte e contas básicas.' },
    { tipo: 'texto', texto: 'Onde guardar? Escolha aplicações de baixo risco e com liquidez, que é a facilidade de transformar a aplicação em dinheiro rapidamente. O objetivo da reserva é estar disponível quando você precisar, não render muito.' },
    { tipo: 'texto', texto: 'Comece pequeno e guarde um valor fixo todo mês, de preferência assim que receber.' },
    { tipo: 'exemplo', titulo: 'Gastos essenciais de R$ 1.200,00 por mês', linhas: [
      'Meta mínima (3 meses): R$ 3.600,00.',
      'Meta máxima (6 meses): R$ 7.200,00.',
      'Guardando R$ 200,00 por mês, a meta mínima chega em 18 meses, sem contar o rendimento.',
    ] },
    { tipo: 'resumo', itens: [
      'A reserva serve para imprevistos e evita dívidas caras.',
      'A meta é de 3 a 6 meses de gastos essenciais.',
      'Guarde em aplicações de baixo risco e com liquidez.',
    ] },
  ],
};

export const tempos: Record<string, number> = { 'orcamento-pessoal-1': 4, 'orcamento-pessoal-2': 4, 'orcamento-pessoal-3': 4 };
