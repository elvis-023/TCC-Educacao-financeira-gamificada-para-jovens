import type { BlocoConteudo } from '@/dados/tipos';

export const conteudo: Record<string, BlocoConteudo[]> = {
  'inflacao-e-investimentos-1': [
    { tipo: 'texto', texto: 'Inflação é o aumento geral e contínuo dos preços. Com o tempo, a mesma quantia de dinheiro compra menos coisas: é o que chamamos de perda do poder de compra.' },
    { tipo: 'texto', texto: 'No Brasil, a inflação oficial é medida pelo IPCA, o Índice Nacional de Preços ao Consumidor Amplo, calculado pelo IBGE. Ele acompanha os preços de uma cesta de produtos e serviços que as famílias consomem.' },
    { tipo: 'texto', texto: 'Por isso o dinheiro parado perde valor: se os preços sobem e o seu dinheiro não rende, você compra menos. Investir ajuda a proteger o poder de compra.' },
    { tipo: 'exemplo', titulo: 'Compras de R$ 500,00 com inflação de 5% ao ano', linhas: [
      'Hoje, as compras custam R$ 500,00.',
      'Um ano depois, as mesmas compras passam a custar R$ 525,00.',
      'Quem deixou o dinheiro parado consegue comprar menos.',
    ] },
    { tipo: 'resumo', itens: [
      'Inflação é o aumento geral dos preços.',
      'O IPCA, medido pelo IBGE, é o índice oficial de inflação.',
      'Dinheiro parado perde poder de compra.',
    ] },
  ],
  'inflacao-e-investimentos-2': [
    { tipo: 'texto', texto: 'O rendimento nominal é o que a aplicação rende no papel. O rendimento real desconta a inflação e mostra quanto o seu poder de compra realmente cresceu, ou diminuiu.' },
    { tipo: 'texto', texto: 'Uma conta aproximada é: ganho real ≈ rendimento − inflação. A conta exata é (1 + rendimento) ÷ (1 + inflação) − 1.' },
    { tipo: 'texto', texto: 'Quando a aplicação rende menos que a inflação, o ganho real é negativo: o saldo até aumenta, mas dá para comprar menos do que antes.' },
    { tipo: 'exemplo', titulo: 'Rendimento nominal contra inflação de 5% ao ano', linhas: [
      'Aplicação de 8% ao ano: ganho real de cerca de 2,86% ao ano.',
      'Aplicação de 3% ao ano: o poder de compra cai cerca de 1,9% ao ano.',
    ] },
    { tipo: 'resumo', itens: [
      'Rendimento real é o rendimento descontada a inflação.',
      'A conta exata é (1 + rendimento) ÷ (1 + inflação) − 1.',
      'Render menos que a inflação significa perder poder de compra.',
    ] },
  ],
  'inflacao-e-investimentos-3': [
    { tipo: 'texto', texto: 'Ativo é qualquer bem ou aplicação que pode gerar renda ou valorização, como ações, títulos e imóveis. Todo ativo tem risco, que é a chance de o resultado ser diferente do esperado, inclusive com perda de dinheiro.' },
    { tipo: 'texto', texto: 'Diversificar é dividir o dinheiro entre ativos diferentes, para que a queda de um não derrube tudo. É a ideia por trás do ditado de não colocar todos os ovos na mesma cesta.' },
    { tipo: 'texto', texto: 'Fundos de investimento reúnem o dinheiro de muitas pessoas para comprar vários ativos, e são um jeito simples de diversificar. A diversificação reduz o risco, mas não o elimina: todo investimento pode ter perdas.' },
    { tipo: 'exemplo', titulo: 'R$ 1.000,00 em uma ação ou divididos em cinco', linhas: [
      'Numa única ação que cai 30%, os R$ 1.000,00 viram R$ 700,00.',
      'Divididos em 5 partes de R$ 200,00, se só uma cair 30%, o total fica em R$ 940,00.',
      'A perda cai de R$ 300,00 para R$ 60,00.',
    ] },
    { tipo: 'resumo', itens: [
      'Ativo é um bem ou aplicação que pode gerar renda; todo ativo tem risco.',
      'Diversificar é não concentrar tudo num único ativo.',
      'Fundos reúnem vários ativos, mas nenhum investimento é livre de perdas.',
    ] },
  ],
};

export const tempos: Record<string, number> = { 'inflacao-e-investimentos-1': 4, 'inflacao-e-investimentos-2': 4, 'inflacao-e-investimentos-3': 4 };
