import type { BlocoConteudo } from '@/dados/tipos';

export const conteudo: Record<string, BlocoConteudo[]> = {
  'juros-compostos-1': [
    { tipo: 'texto', texto: 'Juros são o "aluguel" do dinheiro: quem empresta recebe, quem pega emprestado paga. Quando você guarda dinheiro numa aplicação, é você quem recebe os juros.' },
    { tipo: 'texto', texto: 'Nos juros simples, a taxa incide sempre sobre o valor inicial. Nos juros compostos, ela incide sobre o saldo de cada mês, que já inclui os juros dos meses anteriores: são os "juros sobre juros".' },
    { tipo: 'texto', texto: 'No começo a diferença é pequena, mas ela cresce com o tempo. Por isso os juros compostos ajudam quem investe e pesam para quem está devendo.' },
    { tipo: 'exemplo', titulo: 'R$ 1.000,00 a 1% ao mês por 3 meses', linhas: [
      'Juros simples: R$ 10,00 por mês, e você termina com R$ 1.030,00.',
      'Juros compostos: R$ 1.010,00, depois R$ 1.020,10 e, no fim, R$ 1.030,30.',
      'A diferença ainda é de R$ 0,30, mas aumenta a cada mês.',
    ] },
    { tipo: 'resumo', itens: [
      'Juros compostos rendem sobre o saldo, não só sobre o valor inicial.',
      'A diferença para os juros simples cresce com o tempo.',
      'Juros sobre juros ajudam quem investe e pesam para quem deve.',
    ] },
  ],
  'juros-compostos-2': [
    { tipo: 'texto', texto: 'Aporte é o dinheiro que você acrescenta à aplicação de tempos em tempos, por exemplo todo mês. Os juros compostos funcionam melhor com aportes regulares e, principalmente, com tempo.' },
    { tipo: 'texto', texto: 'Quanto mais cedo você começa, mais meses de juros sobre juros o seu dinheiro acumula. Esperar para começar pode custar mais do que parece.' },
    { tipo: 'texto', texto: 'O valor que você terá no fim do prazo se chama montante: é o que você investiu somado aos juros recebidos. Os simuladores do app calculam o montante para você.' },
    { tipo: 'exemplo', titulo: 'R$ 100,00 por mês a 1% ao mês, com aporte no fim de cada mês', linhas: [
      'Em 12 meses: R$ 1.268,25 (você colocou R$ 1.200,00).',
      'Em 60 meses: R$ 8.166,97 (você colocou R$ 6.000,00).',
      'Os juros somam R$ 2.166,97, e crescem mais rápido a cada ano.',
    ] },
    { tipo: 'resumo', itens: [
      'Aporte é o dinheiro que você acrescenta à aplicação.',
      'Montante é o valor final: o que foi investido mais os juros.',
      'Começar cedo e aportar com regularidade faz o tempo trabalhar a seu favor.',
    ] },
  ],
  'juros-compostos-3': [
    { tipo: 'texto', texto: 'Taxas aparecem ao mês ou ao ano, e não dá para compará-las sem converter. Como os juros são compostos, 1% ao mês não equivale a 12% ao ano: equivale a cerca de 12,68% ao ano.' },
    { tipo: 'texto', texto: 'Por isso não se divide a taxa anual por 12 para achar a taxa mensal. O cálculo correto é a equivalência: a taxa mensal é aquela que, composta por 12 meses, resulta na taxa anual.' },
    { tipo: 'texto', texto: 'O CDI é a taxa de referência dos investimentos de renda fixa, aqueles em que as regras de rendimento são conhecidas na hora da aplicação. Ele é divulgado ao ano; para comparar com uma taxa mensal, converta pela equivalência.' },
    { tipo: 'exemplo', titulo: 'Equivalência entre taxa ao mês e ao ano', linhas: [
      '1% ao mês equivale a 12,68% ao ano, não a 12%.',
      '10% ao ano equivalem a 0,80% ao mês, não a 0,83% (que seria 10 ÷ 12).',
      'Os simuladores do app fazem a conversão desse jeito.',
    ] },
    { tipo: 'resumo', itens: [
      'Taxa ao mês e taxa ao ano precisam ser convertidas por equivalência.',
      'Nunca divida a taxa anual por 12.',
      'O CDI é uma referência anual da renda fixa.',
    ] },
  ],
};

export const tempos: Record<string, number> = { 'juros-compostos-1': 4, 'juros-compostos-2': 4, 'juros-compostos-3': 5 };
