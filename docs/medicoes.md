# Medições

Números **medidos** em 01/11/2026, para a documentação e o artigo. Cada item diz como foi medido, o que o número não cobre e como repetir. Nada aqui vem de dado de participante: o estudo ainda não teve coleta.

Ambiente: Windows 10, Node.js 24.16.0, Chrome instalado na máquina (modo sem janela), build de produção desta versão do código, com `VITE_FONTE_DADOS=local`; banco no Supabase de desenvolvimento.

## 1. Testes automatizados

- `npm run test`: **480 testes em 24 arquivos, todos passando** (regras de negócio em `src/regras/`, repositórios e dados de demonstração).
- `npm audit --omit=dev`: **0 vulnerabilidades** nas dependências de produção.
- `npm run build` e `npm run lint`: sem erros. O build também foi repetido num Linux limpo, com Node 22.16, sem o `.env`.

## 2. Cálculos financeiros (RNF01)

Método: 40 casos de juros compostos e 40 de fatura de cartão, com semente fixa, calculados **fora do código do app**: mês a mês, em Decimal de 50 dígitos (Python), e com as funções `FV` e `PMT` do Excel na planilha [`docs/conferencia/conferencia-calculos.xlsx`](conferencia/conferencia-calculos.xlsx). Os casos incluem o de aceite (C = 1.000, A = 100, i = 1% a.m., t = 12 → R$ 2.395,08), taxa zero, taxa anual convertida por equivalência e 5 faturas em que o teto de 100% é aplicado.

| Conferência | Casos | Divergência máxima (R$) |
|---|---|---|
| Juros compostos: montante | 40 | 0,0000027 (efeito do ponto flutuante em 30 anos) |
| Fatura: parcela, soma das parcelas, juros e total pago | 40 | 0,00000000002 |
| Teto de 100% aplicado de forma diferente | 0 casos | — |
| Valores diferentes depois de arredondar para 2 casas | 0 casos | — |

- Repetir: `python scripts/conferencia/gerar_casos.py`, `npm run conferir:calculos`, `python scripts/conferencia/gerar_planilha.py`.
- A planilha recalcula ao abrir no Excel. As células "Máximo" no fim de cada aba devem dar o mesmo que a tabela acima (a coluna "Planilha" é a fórmula do Excel; a "Python" e a "App" são valores gravados).
- O que não cobre: a regra do cartão é a do projeto (rotativo de um mês, depois Price, soma das parcelas ≤ 2 × saldo); a conferência prova que o código faz o que a regra diz, não que a regra descreve todo contrato real.

## 3. Motor adaptativo (RN02)

Método: testes automatizados com **perfis sintéticos determinísticos** (`src/regras/motorAdaptativo.test.ts`): taxa de acerto de 30% leva o nível a **Fácil** (rebaixa), 60% mantém em **Médio** e 90% leva a **Difícil** (eleva). Há ainda testes da janela deslizante de 5 respostas, dos limiares (4 ou 5 acertos sobem, 3 mantêm, 0 a 2 descem), dos limites do nível e dos parâmetros lidos do administrador. Cobre a **correção do cálculo**, não o efeito pedagógico: a comparação com uma versão não adaptativa não foi feita.

## 4. Banco de questões

`npm run auditar:banco` e `src/regras/bancoQuestoes.test.ts`:

- **336 questões**: 28 por lição, 12 lições, 4 trilhas.
- Por trilha: **21 Fáceis, 42 Médias e 21 Difíceis** (84 por trilha).
- As contas das questões numéricas são calculadas no código; a posição da resposta correta é balanceada; enunciados são únicos depois de normalizar o texto.
- Viés de tamanho: nas 336 questões, a alternativa correta é estritamente a mais longa em 82 (24%); com 4 alternativas, o acaso daria cerca de 25%.
- A dificuldade de cada questão foi atribuída por julgamento do grupo, **sem calibração empírica**.

## 5. Ranking (RF07, HU07: ordenar em menos de 2 s)

Método: [`scripts/carga-ranking.sql`](../scripts/carga-ranking.sql), no banco de desenvolvimento, dentro de uma transação **desfeita no final** (conferido: nenhum usuário sintético restou). Usuários sintéticos com 20 respostas de quiz e 5 de treino cada; 60 repetições da RPC `public.ranking` por período e por tamanho.

| Jovens no banco | Respostas de quiz | Geral p50 / **p95** / máx (ms) | Semana p50 / **p95** / máx (ms) |
|---|---|---|---|
| 1.003 (1.000 sintéticos + 3 contas de teste) | 20.030 | 9,02 / **9,59** / 18,22 | 24,87 / **26,36** / 28,38 |
| 10.003 (10.000 sintéticos + 3 contas de teste) | 200.030 | 80,96 / **82,23** / 127,54 | 283,40 / **287,43** / 300,17 |

- Com 10.000 jovens, o **p95 fica em 82 ms (geral) e 287 ms (semana)**, abaixo dos 2 s do critério de aceite.
- Mede o tempo de execução **dentro do banco**; não inclui rede, autenticação nem a renderização da tela.
- A carga é sintética e serve só para desempenho; não é dado de pesquisa. O ranking usa PostgreSQL (`rank()`), **não Redis**.

## 6. Carregamento de lição (RNF03: até 2 s em 4G)

Método: Chrome automatizado, cache desligado, rede emulada em 9 Mbps de descida, 1,5 Mbps de subida e 60 ms de latência; 5 a 7 repetições. Scripts em `scripts/medicao/`.

| Cenário | Resultado |
|---|---|
| Abrir uma lição a partir da trilha, dentro do app (navegação já carregada) | 22 a 60 ms |
| Abrir **direto pela URL da lição**, carga fria, rede emulada, CPU normal | mediana **1,52 s** (máx 1,57 s) |
| O mesmo com CPU **4 vezes mais lenta** (celular modesto) | mediana **2,12 s** (máx 2,16 s) |
| Carga fria da tela inicial, rede e CPU 4× | 2,1 a 2,3 s |

- Conclusão honesta: com a rede emulada e CPU normal o limite de 2 s é cumprido; com CPU 4× mais lenta, a **carga fria** passa de 2 s em cerca de 0,1 s. A navegação dentro do app é praticamente instantânea.
- Não cobre: rede real da Cloudflare, aparelhos físicos nem uso offline.

## 7. Acessibilidade e contraste (RNF07)

Método: axe-core, em 17 telas (jovem, administrador e telas públicas) nos temas claro e escuro, com as regras WCAG 2.0 A e AA, WCAG 2.1 A e AA e boas práticas.

- **34 telas analisadas, 0 violações.** 22.856 verificações aprovadas.
- 2.724 verificações ficaram "incompletas" (o axe não consegue decidir, por exemplo, contraste sobre gradiente ou imagem). Elas **não** são aprovações: o contraste dessas áreas foi definido nos tokens de cor e não foi medido tela a tela.
- Não substitui teste com leitor de tela nem com pessoas.

## 8. O que ainda não foi medido

- Disponibilidade de 95% (RNF08): é meta de operação; não há medição.
- Modo offline (RNF02) e notificação push (RF09): simulados dentro do app nesta fase.
- Efeito da adaptação sobre o aprendizado e ganho de conhecimento: dependem da coleta, que só ocorre depois da aprovação ética.
