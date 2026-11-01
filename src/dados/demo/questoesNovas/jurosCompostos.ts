import type { Questao } from '@/dados/tipos';
import { arredondar, type Item, montante, pc, questoesDaLicao, r } from './criar';

// Juros Compostos: 72 questões novas (lição 1: 8 Fácil, 13 Médio, 3 Difícil; lição 2: 5, 12, 7; lição 3: 5, 11, 8).
// Todas as contas usam as mesmas fórmulas dos simuladores (RN01): M = C·(1+i)^t + A·((1+i)^t − 1)/i, aporte no fim do mês.

const composto = (capital: number, taxa: number, periodos: number) => capital * Math.pow(1 + taxa, periodos);
const simples = (capital: number, taxa: number, periodos: number) => capital * (1 + taxa * periodos);
/** Taxa ao mês (em %) equivalente a uma taxa ao ano (em %). */
const mensalDeAnual = (anual: number) => (Math.pow(1 + anual / 100, 1 / 12) - 1) * 100;
/** Taxa ao ano (em %) equivalente a uma taxa ao mês (em %). */
const anualDeMensal = (mensal: number) => (Math.pow(1 + mensal / 100, 12) - 1) * 100;

const licao1: Item[] = [
  ['f', 'O que são juros?', 'O "aluguel" do dinheiro: quem empresta recebe', ['Um imposto cobrado sobre a renda', 'Uma tarifa cobrada só pelos bancos digitais', 'O valor do dinheiro guardado em casa'],
    'Juros são o preço do dinheiro no tempo. Quem empresta, ou guarda numa aplicação, recebe; quem pega emprestado paga.'],
  ['f', 'Nos juros simples, sobre qual valor a taxa incide todo mês?', 'Sempre sobre o valor inicial', ['Sobre o saldo do mês anterior, já com juros', 'Sobre a renda da pessoa', 'Sobre o valor da inflação'],
    'Nos juros simples a taxa incide só sobre o valor inicial, por isso os juros são os mesmos em todos os meses.'],
  ['f', 'O que significa "juros sobre juros"?', 'Os juros de cada mês também passam a render', ['A taxa de juros dobra todo mês', 'O banco cobra juros duas vezes', 'Os juros incidem só sobre o valor inicial'],
    'Nos juros compostos, os juros que já foram somados ao saldo também rendem. É daí que vem a expressão "juros sobre juros".'],
  ['f', 'Para quem os juros compostos costumam pesar?', 'Para quem está devendo', ['Para quem guarda dinheiro todo mês', 'Para quem não tem renda', 'Para quem paga sempre à vista'],
    'Os juros compostos ajudam quem investe, porque o saldo rende sobre si mesmo, e pesam para quem deve, porque a dívida também cresce assim.'],
  ['f', 'No começo, como é a diferença entre juros simples e compostos?', 'Pequena, mas cresce com o tempo', ['Enorme, mas diminui com o tempo', 'Nula durante os primeiros anos', 'Sempre a mesma, do começo ao fim'],
    'No primeiro mês os dois dão o mesmo resultado. Depois, os juros compostos passam a render sobre juros e a diferença só aumenta.'],
  ['f', `Qual é o juro simples de ${r(100)} a 10% ao mês, depois de 1 mês?`, r(10), [r(1), r(100), r(110)],
    `${r(100)} × 10% = ${r(10)}. Atenção: ${r(110)} seria o montante, que é o valor investido somado ao juro.`],
  ['f', 'Quando você guarda dinheiro numa aplicação, quem recebe os juros?', 'Você, que emprestou o dinheiro', ['O banco que recebeu o dinheiro', 'O governo, que cobra o imposto', 'A empresa que emite o cartão'],
    'Na aplicação, você empresta o seu dinheiro e, por isso, recebe os juros.'],
  ['f', 'Qual é a característica dos juros compostos?', 'A taxa incide sobre o saldo, já com juros', ['A taxa incide só sobre o valor inicial', 'A taxa cai um pouco a cada mês', 'Os juros são pagos uma única vez no fim'],
    'Nos juros compostos o saldo de cada mês, com os juros já somados, é a base de cálculo do mês seguinte.'],

  ['m', `R$ 5.000,00 rendem a juros simples de 2% ao mês durante 4 meses. Quanto foi de juros?`, r(5000 * 0.02 * 4), [r(100), r(5400), r(composto(5000, 0.02, 4) - 5000)],
    `Os juros simples são iguais todo mês: ${r(5000)} × 2% = ${r(100)}. Em 4 meses: ${r(400)}. Os juros compostos seriam ${r(composto(5000, 0.02, 4) - 5000)}.`],
  ['m', `R$ 1.500,00 rendem 3% ao mês a juros compostos. Qual é o saldo depois de 2 meses?`, r(composto(1500, 0.03, 2)), [r(simples(1500, 0.03, 2)), r(composto(1500, 0.03, 1)), r(1500 + 60)],
    `Mês 1: ${r(1500)} × 1,03 = ${r(1545)}. Mês 2: ${r(1545)} × 1,03 = ${r(composto(1500, 0.03, 2))}. Juros simples dariam ${r(simples(1500, 0.03, 2))}.`],
  ['m', `R$ 2.000,00 rendem 5% ao ano a juros compostos. Qual é o saldo depois de 2 anos?`, r(composto(2000, 0.05, 2)), [r(simples(2000, 0.05, 2)), r(2000 * 1.05), r(2250)],
    `Ano 1: ${r(2000)} × 1,05 = ${r(2100)}. Ano 2: ${r(2100)} × 1,05 = ${r(2205)}. Os juros simples dariam ${r(2200)}.`],
  ['m', `R$ 1.000,00 rendem 2% ao mês. Depois de 3 meses, quanto o saldo a juros compostos supera o de juros simples?`, r(composto(1000, 0.02, 3) - simples(1000, 0.02, 3)), [r(0.12), r(12.1), r(composto(1000, 0.02, 3) - 1000)],
    `Juros simples: ${r(simples(1000, 0.02, 3))}. Juros compostos: ${r(arredondar(composto(1000, 0.02, 3)))}. A diferença é pequena no começo, mas aumenta a cada mês.`],
  ['m', 'Por que, nos juros compostos, o saldo cresce cada vez mais depressa?', 'Porque os juros de cada mês entram no saldo e passam a render', ['Porque a taxa de juros sobe todo mês', 'Porque o valor inicial é somado de novo todo mês', 'Porque o banco cobra uma tarifa menor com o tempo'],
    'A taxa é a mesma, mas incide sobre uma base maior a cada mês. Por isso o crescimento acelera.'],
  ['m', `Uma dívida de ${r(800)} cresce 5% ao mês. Depois de 1 mês, quanto ela vale?`, r(840), [r(805), r(850), r(880)],
    `${r(800)} × 1,05 = ${r(840)}. No primeiro mês, juros simples e compostos dão o mesmo resultado.`],
  ['m', `${r(500)} rendem 8% ao mês a juros compostos. Qual é o saldo depois de 2 meses?`, r(composto(500, 0.08, 2)), [r(simples(500, 0.08, 2)), r(540), r(590)],
    `Mês 1: ${r(500)} × 1,08 = ${r(540)}. Mês 2: ${r(540)} × 1,08 = ${r(583.2)}. Os juros simples dariam ${r(580)}.`],
  ['m', 'Depois de 1 período, o que se pode dizer sobre juros simples e compostos?', 'Dão o mesmo resultado; a diferença vem depois', ['Os compostos já rendem o dobro', 'Os simples rendem mais no 1º período', 'Os compostos nunca passam dos simples'],
    'No primeiro período só existe o valor inicial para render. A diferença aparece quando os juros do primeiro período passam a render também.'],
  ['m', `${r(3000)} rendem juros simples de 1,5% ao mês. Quanto de juros em 6 meses?`, r(270), [r(45), r(135), r(3270)],
    `Por mês: ${r(3000)} × 1,5% = ${r(45)}. Em 6 meses: ${r(45)} × 6 = ${r(270)}. Os ${r(3270)} seriam o montante, e não os juros.`],
  ['m', `${r(1000)} rendem 1% ao mês por 12 meses a juros compostos. Qual é o montante?`, r(composto(1000, 0.01, 12)), [r(simples(1000, 0.01, 12)), r(1100), r(1140)],
    `${r(1000)} × 1,01¹² = ${r(composto(1000, 0.01, 12))}. Os juros simples dariam ${r(1120)}.`],
  ['m', 'Por que os juros compostos pesam mais numa dívida de longo prazo?', 'Porque a dívida cresce sobre ela mesma', ['Porque a taxa fica maior sozinha', 'Porque o valor inicial dobra todo mês', 'Porque o banco proíbe o pagamento antecipado'],
    'A dívida cresce sobre ela mesma. Quanto mais tempo passa sem pagar, maior fica a base de cálculo dos juros.'],
  ['m', `Os juros simples de 2% ao mês sobre ${r(500)} rendem quanto em 1 ano?`, r(500 * 0.02 * 12), [r(10), r(60), r(composto(500, 0.02, 12) - 500)],
    `Por mês: ${r(500)} × 2% = ${r(10)}. Em 12 meses: ${r(120)}. A juros compostos seriam ${r(composto(500, 0.02, 12) - 500)}.`],
  ['m', `Gabriela aplicou ${r(4000)} a juros compostos de 1% ao mês. Depois de 2 meses, qual é o saldo?`, r(composto(4000, 0.01, 2)), [r(4080), r(4040), r(4100)],
    `Mês 1: ${r(4000)} × 1,01 = ${r(4040)}. Mês 2: ${r(4040)} × 1,01 = ${r(4080.4)}. Os ${r(4080)} seriam o resultado de juros simples.`],

  ['d', `${r(1000)} rendem 10% ao ano. Em 3 anos, quanto o montante a juros compostos supera o de juros simples?`, r(composto(1000, 0.1, 3) - simples(1000, 0.1, 3)), [r(10), r(100), r(300)],
    `Simples: ${r(simples(1000, 0.1, 3))}. Compostos: ${r(composto(1000, 0.1, 3))}. A diferença é de ${r(31)}, que vem dos juros sobre juros.`],
  ['d', `Um saldo aplicado a 10% ao mês, a juros compostos, chegou a ${r(1210)} depois de 2 meses. Qual foi o valor inicial?`, r(1000), [r(1100), r(1210 / 1.2), r(1200)],
    `O saldo foi multiplicado duas vezes por 1,10, ou seja, por 1,21. Então o valor inicial foi ${r(1210)} ÷ 1,21 = ${r(1000)}.`],
  ['d', `Com juros compostos de 10% ao mês, em quantos meses ${r(1000)} passam de ${r(2000)}?`, '8 meses', ['7 meses', '10 meses', '12 meses'],
    `Em 7 meses o saldo é ${r(composto(1000, 0.1, 7))}, ainda abaixo de ${r(2000)}. Em 8 meses chega a ${r(composto(1000, 0.1, 8))}. Com juros simples seriam necessários 10 meses.`],
];

const licao2: Item[] = [
  ['f', 'O que é aporte?', 'O dinheiro novo que você coloca na aplicação', ['A taxa que o banco cobra por mês', 'O valor que você retira todo mês', 'O imposto cobrado sobre o rendimento'],
    'Aporte é o dinheiro novo que você coloca na aplicação, por exemplo todo mês. Aportes regulares ajudam os juros compostos a funcionar.'],
  ['f', `Você aplica ${r(1000)} e, no fim, tem ${r(1150)}. O que são os ${r(150)}?`, 'Os juros recebidos', ['O aporte', 'O montante', 'A inflação do período'],
    `O montante é o valor final (${r(1150)}). Subtraindo o que foi investido (${r(1000)}), sobram ${r(150)} de juros.`],
  ['f', 'Por que começar a investir cedo costuma valer a pena?', 'Porque o dinheiro tem mais meses para render juros sobre juros', ['Porque a taxa de juros é maior para quem é jovem', 'Porque o banco devolve os aportes depois de um tempo', 'Porque o imposto desaparece com o tempo'],
    'O tempo é o ingrediente dos juros compostos. Quanto mais cedo se começa, mais meses de juros sobre juros se acumulam.'],
  ['f', 'Qual hábito ajuda mais os juros compostos a trabalharem a seu favor?', 'Fazer aportes regulares e deixar o tempo passar', ['Resgatar o dinheiro todo mês', 'Mudar de aplicação toda semana', 'Aplicar uma única vez e nunca mais olhar'],
    'Aportar com regularidade e dar tempo ao dinheiro é a combinação que mais faz o saldo crescer.'],
  ['f', 'Mantendo a taxa e o prazo, o que acontece com o montante se o aporte mensal aumenta?', 'O montante cresce', ['O montante diminui', 'O montante fica igual', 'O montante vira zero'],
    'Aportes maiores colocam mais dinheiro para render, então o montante final é maior.'],

  ['m', `Você aporta ${r(200)} por mês, no fim de cada mês, a 1% ao mês. Quanto tem depois de 6 meses?`, r(montante(0, 200, 0.01, 6)), [r(1200), r(1260), r(1300)],
    `${r(200)} × ((1,01⁶ − 1) ÷ 0,01) = ${r(montante(0, 200, 0.01, 6))}. Foram investidos ${r(1200)}, e o resto são juros.`],
  ['m', `Com taxa zero, aportando ${r(150)} por mês durante 12 meses, quanto se tem no final?`, r(1800), [r(150), r(900), r(1650)],
    `Sem rendimento, o saldo é só a soma dos aportes: ${r(150)} × 12 = ${r(1800)}.`],
  ['m', `Aportando ${r(100)} por mês durante 5 anos, quanto você terá colocado do próprio bolso?`, r(6000), [r(500), r(1200), r(600)],
    `5 anos são 60 meses: ${r(100)} × 60 = ${r(6000)}. O montante é maior, porque inclui também os juros.`],
  ['m', `Aportes de ${r(300)} por mês durante 36 meses, a 1% ao mês, formam ${r(montante(0, 300, 0.01, 36))}. Quanto desse total são juros?`, r(montante(0, 300, 0.01, 36) - 300 * 36), [r(montante(0, 300, 0.01, 36)), r(300 * 36), r(montante(0, 300, 0.01, 36) / 10)],
    `Foram investidos ${r(300 * 36)}. Juros = ${r(montante(0, 300, 0.01, 36))} − ${r(300 * 36)} = ${r(montante(0, 300, 0.01, 36) - 300 * 36)}.`],
  ['m', `Você começa com ${r(2000)} e aporta ${r(100)} por mês, a 1% ao mês, durante 12 meses. Qual é o montante?`, r(montante(2000, 100, 0.01, 12)), [r(3200), r(3400), r(3600)],
    `Os ${r(2000)} iniciais viram ${r(composto2(2000, 12))} e os aportes somam ${r(montante(0, 100, 0.01, 12))}. Juntos: ${r(montante(2000, 100, 0.01, 12))}.`],
  ['m', 'Ana aporta R$ 100,00 por mês durante 24 meses. Bia aporta R$ 200,00 por mês durante 12 meses. Com a mesma taxa, quem acumula mais?', 'Ana, porque os aportes rendem por mais tempo', ['Bia, porque os aportes dela são maiores', 'As duas acumulam exatamente o mesmo', 'Não dá para saber sem conhecer o banco'],
    `As duas investem ${r(2400)}, mas, a 1% ao mês, Ana chega a ${r(montante(0, 100, 0.01, 24))} e Bia, a ${r(montante(0, 200, 0.01, 12))}. O tempo vale mais do que o tamanho do aporte.`],
  ['m', `Com aportes de ${r(200)} por mês e sem rendimento, em quantos meses se juntam ${r(6000)}?`, '30 meses', ['20 meses', '24 meses', '36 meses'],
    `${r(6000)} ÷ ${r(200)} = 30 meses.`],
  ['m', `Aportes de ${r(100)} por mês, a 1% ao mês, durante 36 meses ou durante 24 meses. Quanto o primeiro plano rende a mais?`, r(montante(0, 100, 0.01, 36) - montante(0, 100, 0.01, 24)), [r(1200), r(1000), r(2000)],
    `36 meses: ${r(montante(0, 100, 0.01, 36))}. 24 meses: ${r(montante(0, 100, 0.01, 24))}. A diferença é maior do que os ${r(1200)} dos 12 aportes extras, porque o tempo também rende.`],
  ['m', `Um plano investe ${r(1200)} de uma vez, hoje. Outro aporta ${r(100)} por mês durante 12 meses. Com a mesma taxa, qual termina com mais dinheiro?`, 'O dos R$ 1.200,00 de uma vez, que rende por mais tempo', ['O de aportes mensais, porque a regularidade rende mais', 'Os dois terminam com exatamente o mesmo valor', 'Nenhum dos dois rende juros'],
    `A 1% ao mês: ${r(montante(1200, 0, 0.01, 12))} contra ${r(montante(0, 100, 0.01, 12))}. Quando todo o dinheiro está disponível desde o início, ele rende por mais tempo.`],
  ['m', 'Mantidos os aportes e o prazo, o que acontece com o montante se a taxa mensal for maior?', 'Ele cresce, pois os juros são maiores', ['Ele diminui, porque os juros pesam', 'Ele fica igual, pois só o aporte importa', 'Ele zera no fim do prazo'],
    'Uma taxa maior significa mais juros sobre o saldo a cada mês, e o montante final aumenta.'],
  ['m', `Aportes de ${r(120)} por mês durante 3 anos: quanto a pessoa investiu do próprio bolso?`, r(120 * 36), [r(360), r(1440), r(3600)],
    `3 anos são 36 meses: ${r(120)} × 36 = ${r(4320)}. O montante é maior porque inclui os juros.`],
  ['m', 'Quando o aporte é feito no fim de cada mês, o aporte do último mês rende juros?', 'Não: ele entra no último dia do mês', ['Sim, ele rende o mês inteiro', 'Sim, ele rende metade do mês', 'Só se for maior que o primeiro'],
    'No cálculo com aporte no fim do mês, o último aporte entra no último dia e não rende. Cada aporte rende por menos meses que o anterior.'],

  ['d', `Aportando ${r(100)} por mês durante 60 meses, a 1% ao mês, o montante é ${r(montante(0, 100, 0.01, 60))}. Se o aporte passar para ${r(200)}, qual é o montante?`, r(montante(0, 200, 0.01, 60)), [r(montante(0, 100, 0.01, 60) + 6000), r(12000), r(montante(0, 100, 0.01, 60) + 10000)],
    `O montante é proporcional ao aporte. Dobrando o aporte, o montante dobra, de cerca de ${r(montante(0, 100, 0.01, 60))} para ${r(montante(0, 200, 0.01, 60))}.`],
  ['d', `Aportes de ${r(250)} por mês durante 48 meses, a 1% ao mês, chegam a ${r(montante(0, 250, 0.01, 48))}. Quanto são os juros?`, r(montante(0, 250, 0.01, 48) - 250 * 48), [r(12000), r(montante(0, 250, 0.01, 48)), r(montante(0, 250, 0.01, 48) / 10)],
    `Foram investidos ${r(250 * 48)}. Os juros são ${r(montante(0, 250, 0.01, 48))} − ${r(250 * 48)} = ${r(montante(0, 250, 0.01, 48) - 250 * 48)}.`],
  ['d', `Com aportes de ${r(500)} por mês, a 1% ao mês, em quantos meses completos se chega a ${r(10000)} ou mais?`, '19 meses', ['18 meses', '20 meses', '24 meses'],
    `Em 18 meses: ${r(montante(0, 500, 0.01, 18))}, ainda abaixo. Em 19 meses: ${r(montante(0, 500, 0.01, 19))}. Sem juros, seriam 20 meses.`],
  ['d', `Quem rende mais em 24 meses, a 1% ao mês: ${r(5000)} aplicados de uma vez ou aportes de ${r(200)} por mês?`, `Os ${r(5000)} de uma vez: ${r(montante(5000, 0, 0.01, 24))} contra ${r(montante(0, 200, 0.01, 24))}`, [`Os aportes mensais: ${r(montante(0, 200, 0.01, 24))} contra ${r(montante(5000, 0, 0.01, 24))}`, 'Rendem exatamente o mesmo valor final', 'Não dá para comparar os dois planos'],
    `O valor inicial rende por 24 meses, enquanto cada aporte rende por menos tempo. O valor inicial maior vence: ${r(montante(5000, 0, 0.01, 24))}.`],
  ['d', `Um aporte de ${r(100)} feito no fim do 1º mês fica rendendo até o fim do 12º mês, a 1% ao mês. Quanto ele vale no fim do 12º mês?`, r(composto(100, 0.01, 11)), [r(composto(100, 0.01, 12)), r(110), r(100)],
    `Ele rende por 11 meses (do fim do mês 1 ao fim do mês 12): ${r(100)} × 1,01¹¹ = ${r(composto(100, 0.01, 11))}.`],
  ['d', `${r(1000)} ficam aplicados a 1% ao mês. Quanto o saldo é maior depois de 24 meses do que depois de 12 meses?`, r(arredondar(composto(1000, 0.01, 24)) - arredondar(composto(1000, 0.01, 12))), [r(composto(1000, 0.01, 12) - 1000), r(2 * (composto(1000, 0.01, 12) - 1000)), r(269.73)],
    `12 meses: ${r(composto(1000, 0.01, 12))}. 24 meses: ${r(composto(1000, 0.01, 24))}. A diferença é maior que os juros do primeiro ano, porque o segundo ano rende sobre um saldo maior.`],
  ['d', `Plano X: aporte de ${r(150)} por mês por 24 meses. Plano Y: ${r(100)} por mês nos primeiros 12 meses e ${r(200)} nos últimos 12. Os dois investem ${r(3600)}. A 1% ao mês, qual termina com mais?`, `X, com ${r(montante(0, 150, 0.01, 24))} contra ${r(y())}`, [`Y, com ${r(y())} contra ${r(montante(0, 150, 0.01, 24))}`, `Os dois terminam com ${r(3600)}`, 'Não dá para comparar'],
    'No plano X os aportes são iguais. No Y, os aportes maiores vêm no fim e rendem por menos tempo. Com o mesmo total investido, o dinheiro que entra mais cedo rende mais.'],
];

function composto2(capital: number, meses: number) {
  return composto(capital, 0.01, meses);
}
function y() {
  return montante(0, 100, 0.01, 12) * Math.pow(1.01, 12) + montante(0, 200, 0.01, 12);
}

const licao3: Item[] = [
  ['f', 'Por que não dá para comparar uma taxa ao mês com uma taxa ao ano sem converter?', 'Porque são de períodos diferentes', ['Porque a taxa ao ano é sempre maior', 'Porque a taxa ao mês não é válida', 'Porque o banco muda uma delas'],
    'Uma taxa ao mês e outra ao ano falam de períodos diferentes. Para comparar, é preciso converter uma delas pela equivalência.'],
  ['f', 'O que é renda fixa?', 'Aplicação com regras de rendimento conhecidas', ['Aplicação que nunca pode perder valor', 'Aplicação que só existe em bancos grandes', 'Aplicação que rende o mesmo para todo mundo'],
    'Na renda fixa as regras do rendimento, como a taxa ou o indexador, são conhecidas no momento da aplicação.'],
  ['f', 'Para que serve converter taxas pela equivalência?', 'Para comparar taxas de períodos diferentes', ['Para aumentar o rendimento da aplicação', 'Para pagar menos imposto sobre o ganho', 'Para evitar o efeito da inflação'],
    'A equivalência traz as taxas para o mesmo período, e só assim a comparação é justa.'],
  ['f', 'Como achar a taxa mensal a partir de uma taxa anual, com juros compostos?', 'Usando a equivalência de taxas', ['Dividindo a taxa anual por 12', 'Multiplicando a taxa anual por 12', 'Usando a taxa anual sem converter'],
    'A taxa mensal equivalente é aquela que, composta por 12 meses, resulta na taxa anual. Dividir por 12 não funciona.'],
  ['f', 'Uma aplicação rende 1% ao mês. A taxa anual equivalente é:', 'Maior que 12%, por juros sobre juros', ['Exatamente 12%, porque 1 × 12 = 12', 'Menor que 12%, por causa do desconto', 'Igual a 1%, a mesma taxa do mês'],
    'Como os juros são compostos, 1% ao mês equivale a cerca de 12,68% ao ano, e não a 12%.'],

  ['m', `Uma taxa de 5% ao ano equivale a qual taxa mensal, aproximadamente?`, pc(mensalDeAnual(5)), [pc(5 / 12), pc(0.5), pc(0.05)],
    `A equivalência é (1,05)^(1/12) − 1 = ${pc(mensalDeAnual(5), 4)}. Dividir 5% por 12 daria ${pc(5 / 12, 4)}, que está errado.`],
  ['m', `Uma taxa de 3% ao mês equivale a qual taxa anual, aproximadamente?`, pc(anualDeMensal(3)), [pc(36), pc(30), pc(3)],
    `(1,03)¹² − 1 = ${pc(anualDeMensal(3))}. Multiplicar por 12 daria 36%, e isso desconsideraria os juros sobre juros.`],
  ['m', `Uma taxa de 8% ao ano equivale a qual taxa mensal, aproximadamente?`, pc(mensalDeAnual(8)), [pc(8 / 12), pc(0.8), pc(0.08)],
    `(1,08)^(1/12) − 1 = ${pc(mensalDeAnual(8), 4)}, e não 8 ÷ 12 = ${pc(8 / 12, 4)}.`],
  ['m', `Uma taxa de 0,5% ao mês equivale a qual taxa anual, aproximadamente?`, pc(anualDeMensal(0.5)), [pc(6), pc(5), pc(6.5)],
    `(1,005)¹² − 1 = ${pc(anualDeMensal(0.5))}. É um pouco mais que os 6% de 0,5 × 12.`],
  ['m', 'Um investimento paga 1,2% ao mês e outro, 14% ao ano. Qual rende mais?', `O de 1,2% ao mês, cerca de ${pc(anualDeMensal(1.2))} ao ano`, ['O de 14% ao ano, porque 14 é maior que 1,2', 'Rendem exatamente o mesmo por ano', 'Não dá para comparar as duas taxas'],
    `Convertendo, 1,2% ao mês equivale a ${pc(anualDeMensal(1.2))} ao ano, acima dos 14%.`],
  ['m', `Alguém divide 24% ao ano por 12 e diz que a taxa mensal é 2%. Qual é o erro?`, `Ignorar os juros sobre juros: o correto é ${pc(mensalDeAnual(24))}`, ['Não há erro: dividir por 12 sempre funciona', 'A taxa mensal correta é 2,5%', 'A taxa mensal correta é 24%'],
    `A taxa mensal equivalente a 24% ao ano é (1,24)^(1/12) − 1 = ${pc(mensalDeAnual(24))}. Dividir por 12 só vale para juros simples.`],
  ['m', `${r(1000)} rendem 12% ao ano, a juros compostos. Depois de 1 ano, o saldo é:`, r(1120), [r(1126.83), r(1012), r(1200)],
    `Em 1 ano, a taxa anual já é a própria taxa do período: ${r(1000)} × 1,12 = ${r(1120)}. Os ${r(1126.83)} seriam de 1% ao mês, que equivale a 12,68% ao ano.`],
  ['m', 'Qual destas é mais claramente uma aplicação de renda fixa?', 'Um título com taxa informada na compra', ['Uma ação de uma empresa de capital aberto', 'Um bilhete de loteria da semana', 'Dólares guardados em casa, sem aplicar'],
    'Na renda fixa as regras do rendimento são conhecidas na hora da aplicação, e é isso que a diferencia das demais aplicações.'],
  ['m', 'Qual é a taxa mensal equivalente a 18% ao ano?', pc(mensalDeAnual(18)), [pc(18 / 12), pc(1.8), pc(0.15)],
    `(1,18)^(1/12) − 1 = ${pc(mensalDeAnual(18))}. Dividir 18% por 12 daria 1,50%.`],
  ['m', `Uma aplicação rende 1% ao mês. Qual é a taxa acumulada em 2 meses?`, pc(((1.01 * 1.01) - 1) * 100), [pc(2), pc(2.1), pc(1)],
    `(1,01)² − 1 = ${pc(((1.01 * 1.01) - 1) * 100)}. É um pouco mais que 2%, por causa dos juros sobre juros.`],
  ['m', `Uma taxa de 0,8% ao mês equivale a qual taxa anual, aproximadamente?`, pc(anualDeMensal(0.8)), [pc(9.6), pc(8), pc(12)],
    `(1,008)¹² − 1 = ${pc(anualDeMensal(0.8))}. Multiplicar 0,8 por 12 daria 9,6%.`],

  ['d', `Uma aplicação rende 15% ao ano. Qual é o rendimento equivalente em 6 meses?`, pc((Math.pow(1.15, 0.5) - 1) * 100), [pc(7.5), pc(7), pc(6)],
    `Para meio ano, (1,15)^(1/2) − 1 = ${pc((Math.pow(1.15, 0.5) - 1) * 100)}. Dividir 15% por 2 daria 7,50%.`],
  ['d', `Uma aplicação rende 0,9% ao mês e outra, 11% ao ano. Qual afirmação está correta?`, `A primeira rende mais: ${pc(anualDeMensal(0.9))} ao ano contra 11%`, ['A segunda rende mais, porque 11% é maior que 0,9%', 'Rendem exatamente igual', 'A primeira rende menos, porque a taxa é pequena'],
    `(1,009)¹² − 1 = ${pc(anualDeMensal(0.9))}, acima dos 11%. Só dá para comparar depois de converter para o mesmo período.`],
  ['d', `${r(2000)} rendem 10% ao ano, e o resultado foi calculado pela taxa equivalente. Qual é o saldo depois de 6 meses?`, r(2000 * Math.pow(1.1, 0.5)), [r(2100), r(2095), r(2200)],
    `Em 6 meses, o fator é (1,10)^(1/2) = ${(Math.pow(1.1, 0.5)).toFixed(4).replace('.', ',')}. ${r(2000)} × ${(Math.pow(1.1, 0.5)).toFixed(4).replace('.', ',')} = ${r(2000 * Math.pow(1.1, 0.5))}.`],
  ['d', 'Uma taxa de 3% ao trimestre equivale a qual taxa anual?', pc((Math.pow(1.03, 4) - 1) * 100), [pc(12), pc(9), pc(3)],
    `São 4 trimestres no ano: (1,03)⁴ − 1 = ${pc((Math.pow(1.03, 4) - 1) * 100)}. A conversão por equivalência funciona para qualquer período.`],
  ['d', 'Qual é a taxa mensal equivalente a 21% ao ano?', pc(mensalDeAnual(21)), [pc(21 / 12), pc(1.5), pc(2)],
    `(1,21)^(1/12) − 1 = ${pc(mensalDeAnual(21))}. Dividir por 12 daria ${pc(21 / 12)}.`],
  ['d', 'Qual é a taxa anual equivalente a 1,5% ao mês?', pc(anualDeMensal(1.5)), [pc(18), pc(19), pc(20)],
    `(1,015)¹² − 1 = ${pc(anualDeMensal(1.5))}. Os 18% de 1,5 × 12 ficam abaixo do valor correto.`],
  ['d', 'Qual cálculo converte corretamente 6% ao ano em taxa mensal?', 'Elevar 1,06 a 1/12 e subtrair 1', ['Dividir 6% por 12', 'Multiplicar 6% por 12', 'Somar 6% a 12 e dividir por dois'],
    'A taxa mensal equivalente é a raiz 12ª do fator anual, menos 1. Dividir por 12 só vale para juros simples.'],
  ['d', 'Uma aplicação paga 0,7% ao mês e outra, 8,5% ao ano. Qual rende mais?', `A primeira, que equivale a cerca de ${pc(anualDeMensal(0.7))} ao ano`, ['A segunda, porque 8,5% é maior que 0,7%', 'Rendem exatamente igual', 'A segunda, porque a taxa anual sempre rende mais'],
    `(1,007)¹² − 1 = ${pc(anualDeMensal(0.7))}, acima dos 8,5% da outra aplicação.`],
];

export const QUESTOES_JUROS_COMPOSTOS: Questao[] = [
  ...questoesDaLicao('juros-compostos-1', 1, licao1),
  ...questoesDaLicao('juros-compostos-2', 2, licao2),
  ...questoesDaLicao('juros-compostos-3', 3, licao3),
];
