# PRD — Educação Financeira Gamificada

Especificação do produto para construir o app em duas etapas. Etapa 1: a interface completa, com telas, componentes, navegação e UX, usando dados fictícios e estado local, sem banco, sem autenticação real e sem APIs. Etapa 2: a conexão ao banco de dados (Supabase), preparada no apêndice (item 8).

| Item | Valor |
|---|---|
| Projeto | TCC de Engenharia de Software — Universidade São Judas Tadeu, Grupo 19 |
| Orientador | Prof. Nelson Aguiar |
| Entrega relacionada | Software funcionando (código + base de dados) — 02/11/2026 |
| Versão deste documento | 1.1, de 01/11/2026, aprovada, com os pontos em aberto decididos (7.5) |
| Fontes | Base do Projeto (requisitos, regras de negócio, casos de uso e classes), artigo científico (Apêndice A, teste diagnóstico) e feedback do orientador |

Como ler este documento

- Cada tela tem um código (T01 a T24) e traz entre parênteses os requisitos atendidos e a prioridade, a rota, o comportamento e os critérios de aceite.
- Prioridades com a nomenclatura do projeto: Essencial, Importante e Desejável.
- Os códigos de requisito seguem a matriz de rastreabilidade da Base do Projeto (RF06 = XP, RF07 = ranking, RF08 = conquistas). Os casos de uso não são citados por número, porque a numeração da matriz não bate com a da seção 3.3 da Base.
- Tudo o que aparece como "dados de demonstração" é fictício e nunca pode ser usado como resultado da pesquisa.

Sumário

1. Objetivo
2. Funcionalidades principais (telas T01 a T23)
3. Tipos de usuários e papéis
4. Estrutura de navegação e rotas
5. Estilo e design
6. Sobre os dados
7. Observações importantes e ordem de construção
8. Apêndice — Modelo de dados para a etapa 2

---

## 1. Objetivo

### 1.1 Produto

Protótipo funcional de um aplicativo web mobile-first de educação financeira gamificada para jovens adultos (18 anos ou mais). O app ensina finanças pessoais com:

- trilhas curtas de conteúdo, divididas em lições;
- quizzes com dificuldade adaptativa ao fim de cada lição (o diferencial do TCC);
- dois simuladores: juros compostos e fatura de cartão de crédito;
- gamificação: XP, conquistas, ranking e sequência de dias de estudo.

### 1.2 Problema

Muitos jovens chegam à vida adulta com baixo letramento financeiro e acumulam dívidas que poderiam ser evitadas.

### 1.3 Objetivo científico

Medir o ganho de conhecimento comparando um teste diagnóstico aplicado antes (pré-uso, Forma A) e depois (pós-uso, Forma B) das trilhas. Como não há grupo de controle, o app e os textos falam sempre em "ganho observado", nunca em "efeito do aplicativo".

### 1.4 Escopo da etapa 1

Dentro do escopo:

- todas as telas, componentes, navegação, estados (carregando, vazio, erro, offline) e microinterações;
- regras de negócio em funções puras e testadas, fora dos componentes;
- dados fictícios, com o estado salvo no localStorage;
- login, offline e notificação push simulados dentro do app.

Fora do escopo agora (ver 7.1): backend, tabelas, autenticação real e APIs (ficam para a etapa 2), notificação push real, sincronização offline real, ranking processado em servidor, atualização automática do CDI, Imposto de Renda e IOF.

### 1.5 Princípios

- Simples e funcional: nada além do que os requisitos pedem.
- Componente exibe; regra calcula. Toda regra de negócio fica em `src/regras/`, coberta por testes.
- Cada tela reflete requisitos já documentados no projeto.
- Dado fictício sempre aparece marcado como fictício.
- Linguagem simples, próxima do jovem, com todo termo financeiro explicado.

### 1.6 Requisitos de referência

| Código | Resumo | Prioridade | Onde neste PRD |
|---|---|---|---|
| RF01 | Cadastro, login e recuperação de senha, com aceite do TCLE e declaração de 18 anos ou mais | Essencial | 2.1 |
| RF02 | Trilhas divididas em lições e quiz com dificuldade adaptativa | Essencial | 2.4, 2.5 |
| RF03 | Simulador de juros compostos com gráfico | Essencial | 2.7 |
| RF04 | Simulador de fatura de cartão: mínimo x total, com juros do rotativo | Essencial | 2.8 |
| RF05 | Teste diagnóstico pré e pós-uso | Importante | 2.2 |
| RF06 | XP por resposta | Essencial | 2.5 |
| RF07 | Ranking por XP | Importante | 2.9 |
| RF08 | Conquistas (badges) | Importante | 2.10 |
| RF09 | Lembrete por inatividade (push simulado nesta fase) | Desejável | 2.10 |
| RF10 | Banco de questões: criar, editar e inativar | Importante | 2.12 |
| RF11 | Parâmetros do motor e da inatividade, com autor e data | Desejável | 2.12 |
| RF12 | Métricas dos testes e exportação em CSV pseudonimizado | Importante | 2.12 |
| RNF01 | Fórmulas financeiras padrão, com duas casas decimais | — | 2.7, 2.8 |
| RNF02 | Conteúdo baixado acessível offline, com sincronização ao reconectar | — | 2.4 |
| RNF03 | Lição carrega em até 2 s em 4G | — | 2.4 |
| RNF04 | Progresso vinculado à conta; dos outros, só o nome no ranking | — | 2.9 |
| RNF05 | Aviso de que o simulador é educativo | — | 2.7, 2.8 |
| RNF06 | Coleta mínima, registro dos aceites e id da pesquisa separado do contato | — | 2.1, 2.12, 8 |
| RNF07 | Contraste de 4,5:1 e rótulos para leitores de tela | — | 5 |
| RNF08 | A indisponibilidade não impede estudar o conteúdo já baixado | — | 2.4 |
| RN01 | Fórmula dos juros compostos | — | 2.7 |
| RN02 | Limiares do motor adaptativo | — | 2.5 |
| RN03 | Pesos de XP | — | 2.5 |
| RN04 | Sequência e lembrete por inatividade | — | 2.10 |
| RN05 | Teto legal do cartão | — | 2.8 |
| RN06 | Taxa sugerida do simulador de juros | — | 2.7 |

Notas: a seção 2.1 da Base do Projeto ainda não traz RF06, RF07 e RF08. As prioridades deles foram decididas neste PRD (7.5, decisão 11) e precisam entrar na documentação. RNF06 a RNF08 aparecem na seção 2.1 da Base, mas são requisitos não funcionais.

---

## 2. Funcionalidades principais

Convenções comuns a todas as telas:

- Estados: carregando (skeleton), vazio (mensagem curta e uma ação), erro (mensagem e "Tentar de novo") e offline (banner, ver 2.4).
- As telas com barra de navegação inferior têm um topo fixo com o título da tela (no Início, a saudação), o XP total, a sequência de dias e o sino de notificações.
- Modo foco, sem barra inferior: pré-teste, pós-teste, lição, quiz e resultado do quiz.
- Toda ação com efeito dá retorno visível: mudança na própria tela ou um toast curto.

### 2.1 Cadastro, login e consentimento (RF01, RNF06 – Essencial)

Fluxo do primeiro acesso: Boas-vindas → Cadastro → Pré-teste → Início. Acessos seguintes: Login → Início.

#### T01 Boas-vindas (RF01 – Essencial)

Rota: `/`

- Nome do app em texto, sem logo: "Educação Financeira Gamificada".
- Uma frase de propósito: "Aprenda a cuidar do seu dinheiro com lições curtas, quizzes, simuladores e conquistas."
- Três destaques com ícone: trilhas e quizzes; simuladores; XP, conquistas e ranking.
- Botões: Criar conta (principal) e Entrar (secundário).
- Rodapé: "Para maiores de 18 anos. Este app faz parte de uma pesquisa de TCC da Universidade São Judas Tadeu."

Critérios de aceite:

1. A tela mostra o nome do app em texto, sem nenhuma logo.
2. Criar conta abre `/cadastro`; Entrar abre `/entrar`.
3. Quem já tem sessão ativa é levado direto à sua área (jovem: `/inicio`, ou `/pre-teste` se ele estiver pendente; administrador: `/admin`).

#### T02 Cadastro (RF01, RNF06 – Essencial)

Rota: `/cadastro`

Campos, com validação (React Hook Form + Zod) e mensagem no próprio campo:

- Nome: obrigatório, de 2 a 80 caracteres.
- E-mail: formato válido e único entre as contas do aparelho ("Já existe uma conta com este e-mail").
- Senha: no mínimo 8 caracteres, com botão de mostrar e ocultar.
- Confirmar senha: igual à senha.

Aceites obrigatórios, todos desmarcados por padrão:

- "Li e aceito o TCLE (Termo de Consentimento Livre e Esclarecido)", com o link "Ler o TCLE", que abre o texto num modal.
- "Li e aceito a Política de Privacidade", com link que abre o texto num modal.
- "Tenho 18 anos ou mais".

Comportamento:

- O botão Criar conta só habilita com todos os campos válidos e os três aceites marcados. Logo abaixo dele, um texto curto diz o que falta (ex.: "Falta aceitar o TCLE").
- Ao criar a conta, o app guarda nome, e-mail, papel jovem, data de cadastro e a data e a hora de cada aceite (TCLE, com a versão do texto aceito; política de privacidade; declaração de 18 anos ou mais), registradas no momento em que a conta é criada.
- Gera o id pseudonimizado da pesquisa (formato `P-` + 4 caracteres hexadecimais, ex.: P-7F3A), guardado num registro separado do nome e do e-mail.
- Nesta etapa a senha não é guardada: não há autenticação real.
- Abre a sessão e leva ao pré-teste.
- O formulário nunca pede outros dados: nada de CPF, data de nascimento, telefone ou dados bancários.

Modais do TCLE e da política de privacidade:

- Texto provisório, com o selo "Texto provisório — será substituído pelo texto oficial aprovado pelo Comitê de Ética em Pesquisa (CEP)".
- TCLE provisório com estes tópicos: objetivo da pesquisa; o que se pede ao participante (usar o app e responder a dois testes curtos); dados coletados (nome, e-mail, respostas dos testes e dados de uso); pseudonimização e análise só agregada; participação voluntária, com desistência a qualquer momento; riscos e benefícios; contato dos pesquisadores e do CEP (a preencher).
- Política provisória com: dados coletados, finalidade, quem tem acesso, por quanto tempo ficam guardados e o aviso de que o app nunca pede dados bancários.
- Os modais fecham com botão, com Esc e tocando fora, sem perder o que já foi digitado no formulário.

Critérios de aceite:

1. Criar conta fica desabilitado até todos os campos estarem válidos e os três aceites marcados, e o texto abaixo do botão diz o que falta.
2. E-mail em formato inválido, senha com menos de 8 caracteres e confirmação diferente mostram erro no próprio campo.
3. E-mail já cadastrado no aparelho mostra "Já existe uma conta com este e-mail".
4. Os links abrem o TCLE e a política em modal, sem apagar o que foi digitado.
5. Depois de criar a conta, o jovem cai em `/pre-teste` com a sessão ativa.
6. O registro do usuário guarda data e hora de cada um dos três aceites e a versão do TCLE; o pseudônimo fica num registro à parte.
7. Nenhum campo além de nome, e-mail, senha e confirmação é pedido.

#### T03 Login (RF01 – Essencial)

Rota: `/entrar`

- Campos E-mail e Senha, botão Entrar, link "Esqueci minha senha" e link "Criar conta".
- Login simulado nesta etapa: valida o formato do e-mail, exige senha com 8 caracteres ou mais e procura o e-mail entre as contas do aparelho. A senha não é conferida, porque não há autenticação real. E-mail não encontrado: "E-mail ou senha incorretos".
- Bloco "Atalhos de demonstração (dados fictícios)" com dois botões: Entrar como jovem (entra como o jovem principal de demonstração) e Entrar como administrador.
- Destino depois de entrar: jovem com pré-teste pendente → `/pre-teste`; jovem → `/inicio`, ou a rota que ele tentou abrir antes do login; administrador → `/admin`.
- A sessão continua ao recarregar a página.

Critérios de aceite:

1. Um e-mail cadastrado no aparelho entra; um e-mail desconhecido mostra "E-mail ou senha incorretos".
2. Entrar como jovem abre o Início do jovem principal; Entrar como administrador abre `/admin`.
3. Recarregar a página mantém a pessoa conectada.
4. Quem tentou abrir uma rota interna sem sessão volta para ela depois de entrar.

#### T04 Esqueci minha senha (RF01 – Essencial)

Rota: `/esqueci-senha`

- Campo E-mail e botão "Enviar link".
- Confirmação simulada, sempre a mesma, exista ou não a conta: "Se houver uma conta com este e-mail, você vai receber um link para criar uma nova senha."
- Link "Voltar para o login".

Critérios de aceite:

1. E-mail em formato inválido mostra erro no campo.
2. Com e-mail válido, aparece a confirmação simulada, sem revelar se a conta existe.

### 2.2 Teste diagnóstico pré e pós-uso (RF05 – Importante)

Regras gerais:

- É uma medição, não um quiz: não dá XP, não mostra a resposta correta e não diz quais perguntas o jovem acertou.
- Uma pergunta por tela, com "Pergunta n de 3" e barra de progresso. As alternativas são opções grandes; o botão Confirmar só habilita depois da escolha. Teclas 1 a 4 (1 a 3 nas perguntas com três alternativas) escolhem a alternativa e Enter confirma. Não há volta para a pergunta anterior.
- "Não sei" é uma resposta válida e conta como não acerto (acerto 0).
- Cada resposta é guardada ao confirmar: teste (tipo, forma, versão e início), pergunta, alternativa marcada, acerto (0 ou 1) e data e hora. Ao fim, o teste recebe a data de conclusão e a nota total (0 a 3).
- Se a página recarregar no meio, o teste continua da próxima pergunta sem resposta, sem duplicar nada.
- Os testes ficam ligados ao pseudônimo da pesquisa, não ao nome nem ao e-mail.
- As perguntas abaixo são usadas exatamente como estão (versão 1.0 das duas formas), adaptadas de Lusardi e Mitchell (2014). Elas nunca aparecem nos quizzes.

Forma A (pré-teste), versão 1.0

1. Suponha que você tenha R$ 100 numa poupança e que a taxa de juros seja de 2% ao ano. Depois de 5 anos, quanto você teria na conta se deixasse o dinheiro render? Alternativas: Mais de R$ 102 / Exatamente R$ 102 / Menos de R$ 102 / Não sei. Correta: Mais de R$ 102.
2. Suponha que a taxa de juros da poupança seja de 1% ao ano e a inflação de 2% ao ano. Depois de 1 ano, você conseguiria comprar mais, exatamente o mesmo ou menos do que hoje com o dinheiro dessa conta? Alternativas: Mais / Exatamente o mesmo / Menos / Não sei. Correta: Menos.
3. Verdadeiro ou falso: comprar ações de uma única empresa normalmente oferece um retorno mais seguro do que um fundo de ações. Alternativas: Verdadeiro / Falso / Não sei. Correta: Falso.

Forma B (pós-teste), versão 1.0

1. Suponha que você tenha R$ 200 numa poupança e que a taxa de juros seja de 3% ao ano. Depois de 5 anos, quanto você teria na conta se deixasse o dinheiro render? Alternativas: Mais de R$ 206 / Exatamente R$ 206 / Menos de R$ 206 / Não sei. Correta: Mais de R$ 206.
2. Suponha que a taxa de juros da poupança seja de 2% ao ano e a inflação de 4% ao ano. Depois de 1 ano, você conseguiria comprar mais, exatamente o mesmo ou menos do que hoje com o dinheiro dessa conta? Alternativas: Mais / Exatamente o mesmo / Menos / Não sei. Correta: Menos.
3. Verdadeiro ou falso: investir todo o dinheiro em um único ativo costuma ser mais seguro do que dividi-lo entre vários ativos. Alternativas: Verdadeiro / Falso / Não sei. Correta: Falso.

#### T05 Pré-teste (RF05 – Importante)

Rota: `/pre-teste` (modo foco)

- Introdução: "Antes de começar, um teste rápido". Texto: são 3 perguntas, levam cerca de 2 minutos, não valem XP e não existe nota boa ou ruim, porque servem para medir o quanto o jovem aprende com o app; "Se não souber, marque Não sei. Isso ajuda a pesquisa." Botão Começar.
- Perguntas 1 a 3 da Forma A.
- Agradecimento: "Agradecemos por responder! Suas trilhas estão liberadas." Botão "Ir para o início".
- No topo, só o botão Sair (encerra a sessão). Não existe "pular".
- Enquanto o pré-teste estiver pendente, qualquer rota da área do jovem leva a esta tela (ver 4.4). Com o pré-teste feito, `/pre-teste` leva ao Início.

Critérios de aceite:

1. Logo depois do cadastro, o jovem vê a introdução do pré-teste. Sem concluí-lo, abrir `/trilhas` (ou outra rota do jovem) leva de volta a `/pre-teste`.
2. Cada pergunta aparece sozinha, com "Pergunta n de 3" e a barra de progresso.
3. Confirmar só habilita com uma alternativa escolhida; teclas 1 a 4 escolhem e Enter confirma.
4. Nenhuma tela mostra resposta correta, acertos, nota ou XP.
5. Ao concluir, ficam guardadas 3 respostas (Forma A, versão 1.0, data e hora, alternativa marcada e acerto) e a nota total, ligadas ao pseudônimo, e as trilhas são liberadas.
6. Recarregar no meio retoma da próxima pergunta, sem duplicar respostas.

#### T06 Pós-teste (RF05 – Importante)

Rota: `/pos-teste` (modo foco)

Estados:

- Bloqueado (nem todas as trilhas concluídas): "Conclua as 4 trilhas para liberar o teste final", com o progresso (ex.: "2 de 4 trilhas concluídas") e a barra, e o botão Ver trilhas.
- Liberado: introdução no mesmo formato do pré-teste, com o título "Teste final" → perguntas 1 a 3 da Forma B → resultado.
- Liberado pela ferramenta de demonstração (ver 2.11): igual ao liberado, com o selo "Liberado pela ferramenta de demonstração".
- Concluído: mostra só o resultado; o teste não pode ser refeito.

Resultado:

- Teste inicial: "x de 3 (y%)" e a data. Teste final: "x de 3 (y%)" e a data.
- Diferença em pontos percentuais, com sinal: "+67 p.p.", "0 p.p." ou "−33 p.p.".
- Duas barras simples (inicial e final) ou dois números grandes.
- Texto: "Este número mostra a sua evolução entre os dois testes." Sem revelar quais perguntas foram acertadas.
- Botão "Voltar ao início".

Critérios de aceite:

1. Com 2 de 4 trilhas concluídas, a tela mostra o bloqueio e "2 de 4 trilhas concluídas".
2. Com as 4 trilhas concluídas, ou com a liberação de demonstração, o teste usa as 3 perguntas da Forma B, versão 1.0.
3. Ao concluir, a tela mostra os percentuais de acerto do pré e do pós e a diferença em pontos percentuais (ex.: 33% no pré e 100% no pós = +67 p.p.), sem respostas corretas e sem XP.
4. As respostas ficam guardadas como no pré-teste, com a forma B.
5. Depois de concluído, `/pos-teste` mostra só o resultado.

### 2.3 Início — painel do jovem

#### T07 Início (RF02 a RF08, RN04 – Essencial)

Rota: `/inicio`

A tela é Essencial; os cards de ranking, conquistas e teste final entram junto com essas funções (Importantes).

Topo (o mesmo em todas as telas com barra inferior; a saudação só no Início):

- Saudação com o nome: "Olá, Alex!".
- XP total com ícone em âmbar (ex.: "120 XP"; para leitor de tela: "120 XP no total").
- Sequência com ícone de chama em laranja (ex.: "4"; para leitor de tela: "Sequência de 4 dias").
- Sino com o número de notificações não lidas; abre `/notificacoes`.

Cards, nesta ordem:

1. Continuar de onde parei: trilha e lição atuais, progresso da trilha e o botão Continuar. Regra: a trilha em andamento com a atividade mais recente; dentro dela, a primeira lição cujo quiz não foi feito ("Ler a lição" ou, se a leitura já foi concluída, "Fazer o quiz"). Sem trilha em andamento: "Comece por: [primeira trilha não iniciada]". Com todas concluídas: "Você concluiu todas as trilhas!" e o atalho para o teste final.
2. Suas trilhas: as 4 trilhas com status e "x de 3 lições", com barra de progresso; tocar abre a trilha.
3. Simuladores: atalhos para juros compostos e fatura do cartão.
4. Próxima conquista e posição no ranking, lado a lado. Próxima conquista = a primeira bloqueada na ordem da lista de conquistas (2.10), com o progresso quando houver (ex.: "Sequência de 7 dias — 4 de 7 dias"). Posição = "7º lugar de 12" no ranking geral. Cada um abre a sua tela.
5. Teste final: bloqueado ("Conclua as 4 trilhas: 1 de 4"), liberado ("Fazer o teste final") ou concluído ("Sua evolução: +67 p.p.").

Critérios de aceite:

1. Com os dados de demonstração, o topo mostra "Olá, Alex!", 120 XP, sequência de 4 dias e 1 notificação não lida.
2. "Continuar de onde parei" mostra Juros Compostos, Lição 2 de 3, com progresso de 1 de 3, e o botão abre a lição 2.
3. O resumo mostra Orçamento Pessoal concluída, Juros Compostos em andamento (1 de 3) e as outras duas não iniciadas.
4. A próxima conquista é Sequência de 7 dias (4 de 7) e a posição é 7º lugar.
5. O card do teste final aparece bloqueado com "1 de 4 trilhas concluídas" e passa a liberado quando as 4 forem concluídas.
6. Depois de um quiz, XP, sequência e posição mudam sem recarregar a página.
7. Enquanto os dados carregam, os cards aparecem como skeleton.

### 2.4 Trilhas e lições (RF02, RNF02, RNF03, RNF08 – Essencial)

Regras:

- 4 trilhas, com 3 lições cada, em ordem fixa dentro da trilha. As trilhas podem ser feitas em qualquer ordem.
- A lição seguinte só abre depois do quiz da anterior.
- Status da trilha: não iniciada (nenhuma leitura nem quiz); em andamento (pelo menos uma leitura ou um quiz, sem os 3 quizzes); concluída (os 3 quizzes feitos).
- Progresso da trilha = quizzes concluídos ÷ 3.
- Ler a lição não dá XP, mas conta como atividade: vale para o dia de uso e zera a contagem de inatividade (2.10). Só a primeira conclusão de cada leitura e de cada quiz conta.
- Rotas das trilhas usam o slug: `orcamento-pessoal`, `juros-compostos`, `cartao-de-credito` e `inflacao-e-investimentos`. As lições usam o número de ordem (1, 2 ou 3).

#### T08 Trilhas (RF02, RNF02 – Essencial)

Rota: `/trilhas`

- 4 cards, um por trilha: título, descrição de uma linha, status com ícone e texto, "3 lições", barra de progresso e, quando iniciada, o nível atual do motor naquela trilha (ex.: "Nível: Médio").
- Selo "Disponível offline" nas trilhas baixadas.

Critérios de aceite:

1. Com os dados de demonstração, Orçamento Pessoal aparece concluída (3 de 3), Juros Compostos em andamento (1 de 3) e Cartão de Crédito e Inflação e Investimentos não iniciadas.
2. O status nunca depende só da cor: há ícone e texto.
3. Tocar num card abre a trilha.

#### T09 Trilha (RF02, RNF02 – Essencial)

Rota: `/trilhas/:trilha`

- Cabeçalho: título, descrição, status, progresso e nível atual do motor nesta trilha (Fácil, Médio ou Difícil).
- Botão Baixar trilha (simulado): mostra uma barra de progresso de cerca de 2 segundos ("Baixando trilha… 60%") e termina com "Disponível offline", guardado no aparelho. Sem internet, o botão fica desabilitado, com o texto "Conecte-se para baixar".
- Lista das 3 lições: número, título, tempo estimado de leitura e o estado com ícone e texto: Concluída, Quiz pendente, Disponível ou Bloqueada.
- Tocar numa lição bloqueada mostra o aviso "Conclua a lição anterior para desbloquear" e não abre nada.

Critérios de aceite:

1. Em Juros Compostos (dados de demonstração), a lição 1 aparece concluída, a 2 disponível e a 3 bloqueada.
2. Tocar na lição 3 mostra "Conclua a lição anterior para desbloquear".
3. Baixar trilha mostra a barra de progresso e, ao fim, o selo "Disponível offline", que continua depois de recarregar a página.

#### T10 Lição (RF02, RNF02, RNF03, RNF08 – Essencial)

Rota: `/trilhas/:trilha/licoes/:licao` (modo foco)

- Cabeçalho: voltar, nome da trilha, "Lição 2 de 3" e o tempo estimado (ex.: "4 min de leitura").
- Conteúdo em blocos curtos de texto (parágrafos de até 3 frases). Todo termo financeiro é explicado na primeira vez em que aparece (ex.: "CDI, a taxa de referência dos investimentos de renda fixa").
- Bloco "Exemplo prático", destacado, com valores em reais.
- Bloco "Resumo", com 3 ou 4 itens.
- Botão fixo no rodapé: "Concluir leitura e fazer o quiz". Ele registra a leitura concluída (data e hora) e abre o quiz.
- Se o quiz da lição já foi feito, o rodapé mostra "Lição concluída" e os botões Próxima lição e Voltar à trilha.
- Conteúdo das 12 lições: ver 6.5.

Critérios de aceite:

1. Abrir pela URL uma lição bloqueada leva de volta à trilha com o aviso de bloqueio.
2. A lição mostra blocos de texto, exemplo prático em reais, resumo e tempo de leitura.
3. "Concluir leitura e fazer o quiz" registra a atividade e abre o quiz da lição.
4. A lição abre em até 2 s depois do toque (RNF03), medido no build de produção com o perfil de rede "Fast 4G" do navegador.

#### Modo offline (RNF02, RNF08 – Essencial)

Simulado nesta etapa, já que todos os dados ficam no aparelho:

- O app acompanha a conexão do navegador (`navigator.onLine` e os eventos `online` e `offline`).
- Sem internet, aparece um banner fixo no topo: "Você está sem internet. As trilhas baixadas continuam disponíveis." (anunciado ao leitor de tela).
- Trilhas baixadas abrem normalmente, com lições e quizzes.
- Nas demais, tocar mostra o aviso "Para abrir esta trilha, conecte-se à internet." Uma lição dessas aberta pela URL mostra o mesmo aviso no lugar do conteúdo.
- Quiz feito offline: respostas, XP e progresso ficam salvos e marcados como não sincronizados. Quando a conexão volta, viram sincronizados e aparece o toast "Conexão de volta. Progresso sincronizado."
- Os simuladores funcionam offline. O ranking mostra a última classificação com "Atualizado às HH:MM".
- Para testar: DevTools do navegador → Network → Offline.

Critérios de aceite:

1. Offline, o banner aparece e some quando a conexão volta.
2. Offline, uma trilha baixada abre lições e quizzes; uma não baixada mostra o aviso de conexão.
3. Um quiz feito offline fica salvo e, ao reconectar, aparece o toast de sincronização.

### 2.5 Quiz adaptativo (RF02, RF06, RN02, RN03 – Essencial)

#### Motor adaptativo (RN02)

Função pura em `src/regras/motorAdaptativo.ts`. A regra é a documentada no TCC (Base do Projeto e artigo, seção 3.2) e não deve ser trocada por outro modelo.

- Estado por jovem e por trilha: o nível atual (Fácil, Médio ou Difícil). Toda trilha começa no Médio.
- Recalculado depois de cada resposta: pega as últimas N respostas do jovem naquela trilha (N = janela, padrão 5). Com menos de N respostas, o nível não muda.
- Com N respostas: taxa = acertos ÷ N. Taxa maior ou igual ao limiar de subida (padrão 80%) → sobe um nível, no máximo até Difícil. Taxa menor ou igual ao limiar de descida (padrão 40%) → desce um nível, no mínimo até Fácil. Entre os dois → mantém. Com N = 5: 4 ou 5 acertos sobem, 0 a 2 descem, 3 mantêm.
- A janela é deslizante, conta as respostas de todos os quizzes da trilha e não é zerada quando o nível muda.
- Janela e limiares vêm dos parâmetros do administrador (T22), lidos a cada resposta. Nada fica fixo no código.

Seleção da próxima questão:

- Candidatas: as questões ativas que o jovem ainda não respondeu, da lição atual e das lições anteriores da mesma trilha. Questão de uma lição seguinte nunca entra, porque o jovem ainda não estudou aquele tema. Esse recorte segue o diagrama de classes (cada Lição tem 1 Quiz, que agrega as suas Questões) e não muda a regra de limiar da RN02.
- Preferência: o nível atual; dentro do mesmo nível, primeiro as questões da lição atual e depois as das lições anteriores, sorteadas.
- Se não houver candidata no nível atual, usa o nível mais próximo que tenha candidatas. No empate (nível atual Médio, sem candidatas no Médio), vale o mais fácil. Ordem de busca: a partir de Fácil → Médio → Difícil; a partir de Médio → Fácil → Difícil; a partir de Difícil → Médio → Fácil.
- Caso extremo (nenhuma candidata em nenhum nível): repete a questão ativa, da lição atual ou de uma anterior, respondida há mais tempo.
- Nunca repete uma questão dentro do mesmo quiz.
- A função recebe a fonte de aleatoriedade como parâmetro, para os testes serem determinísticos.
- Cada resposta guarda o nível da questão e o nível da trilha depois da resposta.

#### XP (RN03)

Função pura em `src/regras/gamificacao.ts`.

- Acerto: Fácil = 10 XP, Médio = 20 XP, Difícil = 35 XP. Erro: 2 XP de participação.
- Vale o nível da questão respondida, não o nível atual do motor.
- Ler a lição e responder aos testes diagnósticos não dão XP.
- O XP entra na hora, a cada resposta, e o ranking se reordena.

#### T11 Quiz (RF02, RF06, RN02, RN03 – Essencial)

Rota: `/trilhas/:trilha/licoes/:licao/quiz` (modo foco)

- Topo: "Quiz da Lição 2", "Questão 1 de 3" com barra de progresso e um botão Fechar, que pede confirmação: "Sair do quiz? As respostas já dadas ficam salvas."
- Questão: etiqueta do nível com ícone de barras e texto (Fácil, Médio ou Difícil), em cores neutras (nunca verde ou vermelho, para não confundir com acerto e erro); enunciado; 4 alternativas (A a D) com área de toque de pelo menos 44 px.
- Teclas 1 a 4 escolhem a alternativa; Enter confirma e, depois do feedback, avança.
- Botão "Confirmar resposta", habilitado só depois da escolha.

Feedback imediato (anunciado ao leitor de tela):

- Acerto: verde, ícone de confirmação e o texto "Resposta certa! +20 XP" (com o XP do nível da questão), mais o link "Ver explicação".
- Erro: vermelho, ícone de erro e o texto "Resposta errada. A correta é a C: [texto da alternativa]", seguido da explicação e de "+2 XP pela participação".
- A alternativa marcada e a correta ficam destacadas com ícone e texto, não só com cor.
- Toast com o XP ganho (ex.: "+20 XP").
- Mudança de nível, logo abaixo do feedback: ao subir, "Mandou bem! As próximas questões vão ficar mais desafiadoras."; ao descer, "Tudo certo! As próximas questões vão ficar um pouco mais tranquilas para você firmar o conteúdo."
- Botão "Próxima questão" ou, na terceira, "Ver resultado".

Outras regras da tela:

- O quiz só abre com a leitura da lição concluída; sem ela, volta para a lição com o aviso "Leia a lição antes do quiz". Quiz já concluído leva ao resultado.
- Quem sai no meio e volta retoma da próxima questão; as respostas já dadas continuam valendo.
- Questões do teste diagnóstico nunca aparecem.

Critérios de aceite:

1. O quiz tem 3 questões, uma por vez, cada uma com 4 alternativas e a etiqueta do nível.
2. Confirmar só habilita com uma alternativa escolhida; 1 a 4 escolhem e Enter confirma e avança.
3. Acerto mostra verde, ícone, texto e o XP do nível (10, 20 ou 35); erro mostra vermelho, ícone, texto, a resposta correta, a explicação e 2 XP.
4. O XP do topo e a posição no ranking mudam logo depois de cada resposta.
5. Com os dados de demonstração, no quiz da lição 2 de Juros Compostos, acertar as duas primeiras questões faz o motor subir de Médio para Difícil depois da segunda resposta (janela com 4 acertos em 5) e mostra a mensagem de subida; a terceira questão vem do nível Difícil.
6. Uma questão inativa nunca aparece e nenhuma questão se repete dentro do mesmo quiz.
7. Mudar a janela ou os limiares em Parâmetros muda o comportamento já na resposta seguinte.
8. O feedback é anunciado pelo leitor de tela.

#### T12 Resultado do quiz (RF02, RF06, RF08 – Essencial)

Rota: `/trilhas/:trilha/licoes/:licao/resultado` (modo foco)

- "Você acertou 2 de 3", XP ganho no quiz (ex.: "+42 XP"), nível atual da trilha e a sequência de dias atualizada.
- Conquistas desbloqueadas neste quiz, em destaque, com o modal de conquista (2.10).
- Botões: Próxima lição (principal) e Voltar à trilha.
- Na última lição da trilha: "Trilha concluída!", com celebração discreta, e o botão Ver trilhas. Se foi a quarta trilha concluída, aparece também o card "Teste final liberado", com o botão Fazer agora.

Critérios de aceite:

1. A tela mostra acertos, XP ganho, nível atual da trilha e as conquistas novas.
2. As conquistas são verificadas ao concluir o quiz e nunca se repetem.
3. No roteiro de demonstração (6.9), acertar as 3 questões do quiz da lição 2 de Juros Compostos dá +75 XP (20 + 20 + 35) e desbloqueia Gabaritou e Desafio Aceito; a sequência fica em 5 dias.
4. Concluir o quiz da terceira lição marca a trilha como concluída e mostra a celebração.
5. Próxima lição abre a lição seguinte, já desbloqueada.

### 2.6 Simuladores

#### T13 Simuladores (RF03, RF04 – Essencial)

Rota: `/simuladores`

- Dois cards: "Juros compostos — veja o seu dinheiro crescer com juros sobre juros" e "Fatura do cartão — compare pagar o total com pagar só o mínimo".
- Lista "Últimas simulações", guardada no aparelho: até 10 itens, do mais recente para o mais antigo, cada um com ícone do tipo, resumo dos valores, resultado principal e data (dd/mm/aaaa). Tocar num item reabre o simulador com os mesmos valores e o resultado.
- Vazio: "Você ainda não fez nenhuma simulação."

Critérios de aceite:

1. Cada card abre o seu simulador.
2. Cada cálculo válido entra no topo da lista com resumo, resultado e data; a lista guarda no máximo 10.
3. Tocar num item reabre o simulador com os mesmos valores e o resultado.
4. Sem simulações, aparece a mensagem de vazio.

### 2.7 Simulador de juros compostos

#### T14 Juros compostos (RF03, RNF01, RNF05, RN01, RN06 – Essencial)

Rota: `/simuladores/juros-compostos`

Campos:

- Valor inicial (R$): máscara de moeda; de R$ 0,00 a R$ 10.000.000,00.
- Aporte mensal (R$): de R$ 0,00 a R$ 1.000.000,00.
- Taxa de juros (%): com alternância "% ao mês" / "% ao ano"; vírgula decimal, até 2 casas; de 0 a 100.
- Prazo: com alternância "meses" / "anos"; número inteiro; de 1 mês a 50 anos (600 meses).

Taxa sugerida (RN06):

- O campo já vem com 10,00% ao ano. Abaixo dele: "Valor de exemplo — será trocado pelo CDI anualizado base 252 do Banco Central".
- Valor e texto ficam numa única constante (`TAXA_SUGERIDA`, em `src/regras/simuladores.ts`), com espaço para a data de referência e a fonte, para que a troca pelo valor real seja feita só ali.
- Logo abaixo do campo de taxa, a equivalência na outra unidade (ex.: "Equivale a 0,80% ao mês").

Cálculo (RN01, RNF01), na função `calcularMontante`:

- M = C × (1 + i)^t + A × [((1 + i)^t − 1) / i], com aporte no fim de cada mês. C = valor inicial; A = aporte mensal; i = taxa mensal; t = prazo em meses.
- Taxa anual vira mensal por equivalência: i = (1 + taxa anual)^(1/12) − 1. Nunca taxa anual ÷ 12.
- Prazo em anos vira meses: anos × 12.
- Taxa 0: M = C + A × t, sem divisão por zero.
- Precisão total nas contas; duas casas decimais só na exibição.

Resultados:

- Montante final, total investido (C + A × t) e total de juros (montante − total investido), em reais.
- Gráfico de área mês a mês, comparando o saldo com o total investido.
- Depois do primeiro cálculo, um slider de prazo, na mesma unidade do campo, atualiza o gráfico e os resultados na hora (e o campo Prazo junto).
- "Ver tabela mês a mês", recolhida por padrão (Desejável).

Botões: Calcular (também com Enter) e Limpar, que volta ao estado inicial, com a taxa sugerida.

Validação, com mensagem no próprio campo e cálculo bloqueado: campo vazio; valor negativo; prazo menor que 1 mês; valores acima dos limites; valor inicial e aporte iguais a zero ao mesmo tempo ("Informe um valor inicial ou um aporte maior que zero").

Aviso fixo, sempre visível (RNF05, RN06): "Simulação educativa. Não constitui recomendação de investimento. A taxa não é atualizada automaticamente e o cálculo não desconta Imposto de Renda nem IOF."

Cada cálculo válido entra em "Últimas simulações".

Critérios de aceite:

1. Valor inicial de R$ 1.000,00, aporte de R$ 100,00, taxa de 1% ao mês e 12 meses resultam em montante de R$ 2.395,08, total investido de R$ 2.200,00 e juros de R$ 195,08.
2. Os mesmos valores com taxa de 0% resultam em R$ 2.200,00, sem erro.
3. Valor inicial de R$ 1.000,00, aporte zero, 10% ao ano e 12 meses resultam em R$ 1.100,00 (prova da equivalência; com taxa anual ÷ 12 o resultado seria R$ 1.104,71, que está errado).
4. Prazo de 1 ano dá o mesmo resultado que 12 meses.
5. Campos vazios, valores negativos ou prazo menor que 1 mês bloqueiam o cálculo, com mensagem no campo.
6. O slider muda gráfico e resultados sem recarregar.
7. O campo de taxa já vem com 10,00% ao ano e o texto de valor de exemplo.
8. O aviso educativo fica visível antes e depois do cálculo.
9. Os valores aparecem como R$ 1.234,56, com números tabulares.

### 2.8 Simulador de fatura de cartão de crédito

#### T15 Fatura do cartão (RF04, RNF01, RNF05, RN05 – Essencial)

Rota: `/simuladores/cartao-de-credito`

Campos:

- Valor total da fatura (R$): maior que zero, até R$ 1.000.000,00.
- Valor do pagamento mínimo (R$): maior que zero.
- Taxa do rotativo (% ao mês): de 0 a 100.
- Taxa do parcelamento (% ao mês): de 0 a 100.
- Número de parcelas: de 2 a 24, padrão 12.
- Texto de ajuda: "Use valores de exemplo. O app nunca pede dados do seu cartão."

Bloqueio: pagamento mínimo maior ou igual ao total da fatura não calcula e mostra "Com esse pagamento não sobra saldo para o rotativo: não há incidência de juros do rotativo."

Cálculo (RN05, RNF01), na função `simularFatura`:

1. Pagar o total: total pago = valor da fatura; juros = R$ 0,00.
2. Pagar só o mínimo (regra atual):
   - Mês 0: paga o mínimo. O saldo S = fatura − mínimo entra no rotativo.
   - Mês 1: o rotativo dura só até a próxima fatura (Resolução CMN nº 4.549/2017). Juros do rotativo = S × taxa do rotativo. O saldo dessa fatura, S1 = S + juros do rotativo, é parcelado.
   - Meses 2 a n + 1: parcelas iguais pela tabela Price, com a primeira um mês depois: parcela = S1 × p ÷ (1 − (1 + p)^−n), com p = taxa do parcelamento. Com p = 0, parcela = S1 ÷ n.
   - Juros totais = juros do rotativo + juros do parcelamento = soma das parcelas − S.
   - Teto legal (Lei nº 14.690/2023; Resolução CMN nº 5.112/2023): os juros totais não podem passar de 100% de S, ou seja, a soma das parcelas fica limitada a 2 × S. Se passar, a parcela vira 2 × S ÷ n, os juros totais ficam iguais a S, e a tabela usa a taxa de parcelamento efetiva que gera essa parcela (calculada numericamente; é o mesmo valor que a função TAXA do Excel devolve). Aparece o aviso: "Teto legal aplicado: os juros foram limitados a 100% do saldo que foi para o rotativo (Lei nº 14.690/2023). A taxa do parcelamento caiu de 12,00% para 5,00% ao mês."
   - Total pago = mínimo + soma das parcelas.

Resultados:

- Dois cards lado a lado: "Pagando o total" (total pago e juros de R$ 0,00) e "Pagando só o mínimo" (total pago e total de juros).
- Destaque: "Pagar só o mínimo custa R$ X a mais."
- Gráfico de barras comparando os dois cenários, com o total pago dividido em valor da fatura e juros.
- Tabela mês a mês: Mês, Situação, Pagamento, Juros do mês e Saldo devedor. Linhas: mês 0 (pagamento mínimo), mês 1 (rotativo) e uma linha por parcela ("Parcela 3 de 12").
- Nota: "Os valores são arredondados só na exibição; a soma das parcelas exibidas pode diferir do total em alguns centavos."

Aviso fixo, sempre visível (RNF05): "Simulação educativa e simplificada. Não constitui recomendação financeira. Não considera multa, juros de mora nem IOF."

Botões: Simular (também com Enter) e Limpar. Cada simulação válida entra em "Últimas simulações".

Critérios de aceite:

1. Fatura de R$ 1.000,00, mínimo de R$ 150,00, rotativo de 15% ao mês, parcelamento de 9% ao mês e 12 parcelas: juros do rotativo de R$ 127,50; saldo parcelado de R$ 977,50; 12 parcelas de R$ 136,51; total pago de R$ 1.788,10; juros de R$ 788,10; sem teto.
2. Os mesmos valores com parcelamento de 12% ao mês e 24 parcelas: teto aplicado; 24 parcelas de R$ 70,83 (soma de R$ 1.700,00, ou seja, 2 × R$ 850,00); juros de R$ 850,00; total pago de R$ 1.850,00; aviso do teto com a taxa efetiva de 5,00% ao mês.
3. Fatura de R$ 1.000,00, mínimo de R$ 150,00, rotativo de 10% ao mês, parcelamento de 0% e 10 parcelas: parcelas de R$ 93,50; total pago de R$ 1.085,00; juros de R$ 85,00.
4. Mínimo maior ou igual à fatura bloqueia o cálculo com o aviso.
5. O cenário "Pagando o total" mostra juros de R$ 0,00.
6. Campos vazios, valores negativos e parcelas fora de 2 a 24 mostram erro no campo.
7. A tabela tem o mês 0, o mês 1 (rotativo) e uma linha por parcela, e termina com saldo de R$ 0,00.
8. O aviso educativo fica visível antes e depois do cálculo.

### 2.9 Ranking

#### T16 Ranking (RF07, RNF04 – Importante)

Rota: `/ranking`

- Alternância "Geral" / "Esta semana". É o único filtro do ranking.
- Lista ordenada por XP: posição, nome de exibição e XP. De cada participante aparecem só o nome e o XP.
- Nome de exibição = primeiro nome e inicial do sobrenome (ex.: "Bruna M."), para expor o mínimo.
- Os 3 primeiros têm destaque: ícone de medalha, "1º", "2º" e "3º" e fundo suave.
- A linha do jovem logado fica destacada ("Alex L. (você)") e fixa no rodapé da lista quando não estiver visível.
- Ordenação: XP decrescente; empate dá a mesma posição (1º, 2º, 2º, 4º), em ordem alfabética entre os empatados.
- "Esta semana" soma o XP de segunda-feira 00h00 a domingo 23h59, no fuso America/Sao_Paulo.
- Só jovens entram no ranking; o administrador não.
- O ranking se reordena na hora quando o jovem ganha XP (simulando tempo real), com uma animação curta da troca de posição, e mostra "Atualizado às HH:MM".
- Subtítulo: "Participantes fictícios (demonstração)".
- Offline: mostra a última classificação e o horário dela.

Critérios de aceite:

1. Com os dados de demonstração, "Geral" mostra 12 jovens e Alex L. em 7º lugar, com 120 XP.
2. Depois de ganhar XP num quiz, a posição muda sem recarregar e o horário de atualização muda.
3. Quando a linha do jovem sai da área visível, ela aparece fixa no rodapé.
4. Nenhum dado além de posição, nome de exibição e XP aparece.
5. "Esta semana" usa só o XP da semana corrente.

### 2.10 Conquistas, sequência e lembretes (RF08, RF09, RN04)

#### Conquistas (RF08 – Importante)

| Ordem | Conquista | Critério mostrado na tela | Ícone sugerido (lucide) |
|---|---|---|---|
| 1 | Primeiro Quiz | Conclua seu primeiro quiz | CircleCheck |
| 2 | Primeira Trilha | Conclua todas as lições de uma trilha | Flag |
| 3 | Sequência de 7 dias | Estude 7 dias seguidos | Flame |
| 4 | Gabaritou | Acerte as 3 questões de um quiz | Target |
| 5 | Desafio Aceito | Chegue ao nível Difícil em uma trilha | Mountain |
| 6 | Mestre das Finanças | Conclua as 4 trilhas | Crown |

Regras:

- Verificadas ao concluir um quiz (Conceder Badge estende Realizar Quiz), na função `verificarConquistas`.
- Nunca duplicam: cada conquista vale uma vez por jovem, com a data em que foi obtida.
- Desafio Aceito vale quando o nível da trilha (o estado do motor) chega a Difícil, não quando uma questão difícil aparece pelo nível mais próximo.
- Sequência de 7 dias usa a sequência já atualizada com o dia de hoje.
- Ao desbloquear, o app cria também uma notificação do tipo conquista.

Modal de conquista: um único modal lista todas as conquistas novas daquele quiz, com ícone, nome e "Conquistada em dd/mm/aaaa", uma animação discreta (escala e brilho, até 1 s, sem animação quando o sistema pede menos movimento) e o botão Continuar.

#### Sequência de dias (RN04 – Importante)

Funções puras em `src/regras/sequencia.ts`.

- Dia de uso = dia-calendário (00h00 a 23h59, fuso America/Sao_Paulo) com pelo menos uma lição ou um quiz concluído. Sempre no fuso, nunca em UTC: em UTC o dia vira às 21h de Brasília.
- Sequência = número de dias de uso consecutivos.
- Zera quando um dia termina sem uso. Enquanto o dia de hoje não acabou, a sequência que vem de ontem continua valendo.
- Guardar a sequência (`diasStreak`) e o último dia de uso. Na leitura: se o último dia de uso for anterior a ontem, a sequência exibida é 0. Ao registrar um novo dia de uso: se o último foi ontem, soma 1; se foi hoje, não muda; nos outros casos, volta a 1.

#### Lembretes (RF09, RN04 – Desejável)

Nesta etapa o lembrete simula a notificação push, que só vai existir com backend.

- Atividade = lição ou quiz concluído. Inatividade = horas corridas desde a última atividade.
- Gera um lembrete quando, ao mesmo tempo: "Receber lembretes" está ligado; existe uma trilha iniciada e não concluída; e a inatividade passou do limite (padrão 48 h, em Parâmetros).
- Gera no máximo um lembrete por período de inatividade (não repete a cada recarga). Uma nova atividade abre um novo período.
- A checagem roda ao abrir o app, ao voltar para a aba, a cada minuto com o app aberto e logo depois que o relógio simulado muda (2.11).
- O lembrete vira uma notificação na central (sino) e um toast. Texto: "Sua trilha Juros Compostos está esperando por você. Que tal continuar a Lição 2?" Tocar leva à trilha.
- Com "Receber lembretes" desligado, nenhum lembrete é gerado.

#### T17 Conquistas (RF08 – Importante)

Rota: `/conquistas` (abre pelo Perfil e pelo card do Início)

- Contagem no topo: "2 de 6 conquistas".
- Grade de 2 colunas. Obtidas: ícone colorido (âmbar), nome e "Conquistada em dd/mm/aaaa". Bloqueadas: ícone em cinza com cadeado, nome, o texto "Bloqueada", o critério e o progresso quando houver (ex.: "4 de 7 dias", "1 de 4 trilhas").

Critérios de aceite:

1. Com os dados de demonstração, Primeiro Quiz e Primeira Trilha aparecem coloridas e com data; as outras 4, bloqueadas e com o critério.
2. Ao desbloquear uma conquista, aparece o modal com animação discreta e a conquista passa a colorida, com a data do dia.
3. A mesma conquista nunca aparece duas vezes nem abre dois modais.
4. O estado bloqueado não depende só da cor: há cadeado e texto.

#### T18 Notificações (RF09 – Desejável)

Rota: `/notificacoes` (abre pelo sino no topo)

- Lista do mais recente para o mais antigo: ícone do tipo (lembrete, conquista ou aviso do sistema), mensagem e "dd/mm/aaaa às HH:MM".
- As não lidas têm marcador visual e o texto "Nova" para leitor de tela.
- Tocar numa notificação marca como lida e abre o destino dela (ex.: a trilha). Botão "Marcar todas como lidas".
- O sino mostra o número de não lidas (para leitor de tela: "Notificações, 1 não lida").
- Vazio: "Nenhuma notificação por aqui."

Critérios de aceite:

1. Com os dados de demonstração, aparecem 3 notificações, 1 delas não lida, e o sino mostra 1.
2. Tocar numa notificação marca como lida e o contador diminui.
3. Depois de "Simular 48 h sem acesso", aparece um lembrete novo na lista, com toast, e o contador aumenta.
4. Com "Receber lembretes" desligado, simular as 48 h não gera lembrete.

### 2.11 Meu Perfil

#### T19 Perfil (RF01, RF05, RF08, RF09, RNF06 – Essencial; a opção de lembretes é Desejável)

Rota: `/perfil`

- Cabeçalho: as iniciais do nome num círculo (sem foto), nome, e-mail e "No app desde dd/mm/aaaa".
- Resumo: XP total, sequência atual e conquistas ("2 de 6", com o link Ver conquistas).
- Meus testes: teste inicial ("1 de 3 (33%) em dd/mm/aaaa") e teste final (bloqueado com o progresso das trilhas, liberado com o botão Fazer agora, ou o resultado com a diferença em pontos percentuais). Sem mostrar respostas corretas.
- Preferências: "Receber lembretes" (ligado por padrão) e "Tema escuro" (desligado por padrão; salvo no aparelho).
- Termos: "Ler o TCLE" e "Política de privacidade", em modal, cada um com "Aceito em dd/mm/aaaa às HH:MM".
- Ferramentas de demonstração (abaixo).
- Botão Sair: encerra a sessão e volta para as boas-vindas.

Ferramentas de demonstração (apoio à apresentação do TCC; não é requisito e não vai para a coleta real):

- Seção com borda tracejada e o aviso "Só para a apresentação do TCC — dados fictícios". O mesmo painel abre na área do administrador.
- Entrar como administrador / Entrar como jovem: troca a sessão para a conta de demonstração do outro papel e abre a área dela.
- Simular 48 h sem acesso: avança o relógio simulado do app pelo limite de inatividade atual (48 h por padrão; se o limite mudar, o rótulo acompanha, ex.: "Simular 72 h sem acesso"). Na sequência, roda a checagem de lembretes. Enquanto o relógio estiver avançado, um aviso discreto aparece no topo ("Relógio simulado: +48 h").
- Liberar o pós-teste: libera o teste final sem exigir as 4 trilhas.
- Reiniciar dados de demonstração: pede confirmação ("Isso apaga o progresso feito neste aparelho e restaura os dados fictícios. Continuar?"), restaura os dados iniciais, zera o relógio simulado e a liberação do pós-teste e mantém o tema. Depois, entra na conta de demonstração do papel atual.

Critérios de aceite:

1. O Perfil mostra nome, e-mail, data de cadastro, XP, sequência, conquistas e o resultado dos testes (pré e, quando houver, pós).
2. Desligar "Receber lembretes" impede novos lembretes; a escolha continua depois de recarregar.
3. O tema escuro muda o app na hora e continua depois de recarregar.
4. Os termos abrem em modal e mostram a data e a hora do aceite.
5. Simular 48 h zera a sequência na hora e gera o lembrete (com a opção ligada e uma trilha iniciada).
6. Liberar o pós-teste muda o card do Início e o `/pos-teste` para liberado.
7. Reiniciar volta todos os números aos dados de demonstração (120 XP, 7º lugar, sequência de 4 dias).
8. Sair encerra a sessão; as rotas internas passam a pedir login.

### 2.12 Área do administrador (RF10, RF11, RF12, RNF06)

Layout comum:

- Menu lateral fixo: Visão geral, Banco de questões, Parâmetros e Exportar dados. No rodapé do menu: Ferramentas de demonstração (abre o mesmo painel do Perfil), Voltar ao app (nesta etapa, entra como o jovem de demonstração e abre o Início) e Sair.
- No topo de todas as páginas: o título e o selo "Dados de demonstração (fictícios)".
- Abaixo de 1024 px de largura, o menu vira uma gaveta aberta por um botão.
- Só abre no papel de administrador (ver 4.4).

#### T20 Visão geral (RF12, RNF06 – Importante)

Rota: `/admin`

Os números são calculados a partir das respostas registradas, incluindo as do jovem principal.

- Linha 1, quatro KPIs: Participantes; Pré-testes concluídos; Pós-testes concluídos; Ganho observado médio, em pontos percentuais, calculado só com quem fez os dois testes, com o n logo abaixo (ex.: "+26,7 p.p. — n = 5").
- Linha 2: gráfico de barras agrupadas com o percentual de acerto por pergunta (P1, P2 e P3) no pré e no pós, usando só os participantes com os dois testes, com o n no título. Eixo de 0% a 100% e o valor em cada barra.
- Linha 3: tabela de participantes pseudonimizados: Pseudônimo, Data do pré, Nota do pré, Data do pós e Nota do pós (nota no formato "2/3 (67%)"; "—" quando não houver).
- Nota de rodapé: "Sem grupo de controle: o número mostra o ganho observado, não o efeito do aplicativo."
- Sem participantes com os dois testes: o KPI de ganho mostra "—" e o gráfico, "Ainda não há participantes com os dois testes."

Critérios de aceite:

1. O selo "Dados de demonstração (fictícios)" aparece no topo.
2. Com os dados de demonstração: 12 participantes, 12 pré-testes e 5 pós-testes; o ganho médio usa só esses 5.
3. Depois que o jovem principal faz o pós-teste, KPIs, gráfico e tabela mudam sem recarregar.
4. Nenhum nome ou e-mail aparece: só o pseudônimo.
5. A tela usa a expressão "ganho observado" e nunca "efeito do aplicativo".

#### T21 Banco de questões (RF10 – Importante)

Rota: `/admin/questoes`

- Tabela: Enunciado (até 2 linhas), Trilha, Lição, Nível, Status (Ativa ou Inativa, com ícone e texto) e Editar. Contagem no topo (ex.: "48 questões · 48 ativas").
- Busca por texto no enunciado, sem diferenciar maiúsculas nem acentos. É o único filtro.
- Botão Nova questão e ação Editar abrem um painel lateral com: Trilha, Lição (só as da trilha escolhida), Nível, Enunciado, Alternativas A a D, Resposta correta (A a D), Explicação e o interruptor Ativa.
- Validação (Zod), com mensagem no campo: todos os campos obrigatórios; enunciado de 10 a 300 caracteres; alternativas de 1 a 150 caracteres e diferentes entre si; explicação de 10 a 400 caracteres.
- Não existe excluir: a questão só é inativada ou reativada pelo interruptor Ativa.
- Proteções: a lição 1 de cada trilha mantém pelo menos 3 questões ativas, porque o quiz dela só pode usar questões dela (o quiz tem 3); inativar uma questão, ou mudá-la de lição, quando isso deixaria menos de 3 é bloqueado com explicação; enunciado igual ao de uma pergunta do teste diagnóstico (ignorando maiúsculas, acentos e pontuação) é bloqueado.
- Efeito imediato: a questão inativada sai do sorteio do quiz; a nova, ativa, entra.
- Toasts: "Questão salva", "Questão inativada", "Questão reativada".
- Busca sem resultado: "Nenhuma questão encontrada para [termo]".

Critérios de aceite:

1. A tabela lista as 48 questões, com trilha, lição, nível e status, e a busca filtra pelo enunciado enquanto se digita.
2. Criar e editar acontecem no painel lateral, com validação no campo.
3. Não há botão nem ação de excluir.
4. Uma questão inativada não aparece mais no quiz.
5. Inativar a questão que deixaria a lição 1 da trilha com menos de 3 ativas é bloqueado, com explicação.

#### T22 Parâmetros (RF11 – Desejável)

Rota: `/admin/parametros`

- Formulário com os valores atuais:
  - Limite de inatividade (horas): padrão 48; inteiro de 1 a 720.
  - Janela do motor (respostas): padrão 5; inteiro de 3 a 20.
  - Limiar de subida (%): padrão 80; de 1 a 100.
  - Limiar de descida (%): padrão 40; de 0 a 99.
- O limiar de descida precisa ser menor que o de subida ("O limiar de descida precisa ser menor que o de subida").
- Salvar registra autor e data e hora de cada valor alterado e aplica os novos valores no quiz na hora. Toast: "Parâmetros salvos. O quiz já usa os novos valores."
- Histórico de alterações, do mais recente para o mais antigo: Data e hora, Autor, Parâmetro, Valor anterior e Novo valor. As primeiras linhas mostram os valores padrão, com o autor "Sistema (valor padrão)".

Critérios de aceite:

1. O formulário abre com 48 h, 5 respostas, 80% e 40%.
2. Descida maior ou igual à subida bloqueia o salvamento, com mensagem no campo.
3. Salvar acrescenta uma linha no histórico por valor alterado, com autor e data e hora.
4. Com a janela mudada para 3, o motor passa a avaliar as últimas 3 respostas já no próximo quiz.

#### T23 Exportar dados (RF12, RNF06 – Importante)

Rota: `/admin/exportar`

- Prévia em tabela com as 20 primeiras linhas e o total (ex.: "51 linhas").
- Colunas, nesta ordem: `id_pseudonimizado` (ex.: P-7F3A); `tipo_teste` (pre ou pos); `forma` (A ou B); `versao`; `data` (dd/mm/aaaa, fuso de São Paulo); `pergunta` (1 a 3); `resposta_marcada` (texto da alternativa); `acerto` (0 ou 1); `nota_total` (0 a 3).
- Uma linha por pergunta respondida, ordenadas por pseudônimo, tipo (pré antes de pós) e pergunta.
- Botão Baixar CSV: separador ponto e vírgula, UTF-8 com BOM e quebra de linha CRLF, para abrir certo no Excel. Campos com ponto e vírgula ou aspas vão entre aspas, com as aspas internas duplicadas.
- Nome do arquivo: `respostas-testes-demonstracao-AAAA-MM-DD.csv` (na etapa 2, no projeto de produção, sem "demonstracao").
- Sem nome, sem e-mail e sem o id interno do usuário.

Critérios de aceite:

1. O CSV abre no Excel em português com acentos corretos e uma coluna por campo.
2. Com os dados de demonstração, o arquivo tem cabeçalho e 51 linhas (12 pré-testes e 5 pós-testes, com 3 perguntas cada).
3. Nenhuma coluna traz nome ou e-mail.
4. "Não sei" aparece como resposta marcada, com acerto 0.
5. A prévia mostra as mesmas colunas do arquivo.

---

## 3. Tipos de usuários e papéis

| Ação | Jovem | Administrador |
|---|---|---|
| Criar conta pela tela | Sim, com os três aceites | Não (a conta é criada pelo grupo; nesta etapa, a de demonstração) |
| Entrar, recuperar senha e sair | Sim | Sim |
| Responder ao pré-teste e ao pós-teste | Sim | Não |
| Estudar trilhas, fazer quizzes e usar simuladores | Sim | Não (pode entrar como o jovem de demonstração nesta etapa) |
| Ver XP, sequência, conquistas, testes e notificações | Só os próprios | Não se aplica |
| Ver o ranking | Nome de exibição e XP de todos os jovens | Não se aplica |
| Abrir a área do administrador | Não | Sim |
| Manter o banco de questões e os parâmetros | Não | Sim |
| Ver métricas e exportar as respostas dos testes | Não | Sim, sempre pelo pseudônimo |
| Usar as ferramentas de demonstração | Sim (só nesta etapa) | Sim (só nesta etapa) |

Sistema (sem tela). Nesta etapa, tudo roda no front-end, com estado local:

- Motor adaptativo: depois de cada resposta de quiz.
- XP e ranking: a cada resposta; o ranking se reordena na hora.
- Conquistas: ao concluir cada quiz.
- Sequência: a cada lição ou quiz concluído e a cada leitura da tela.
- Lembretes: ao abrir o app, ao voltar para a aba, a cada minuto e depois de mudar o relógio simulado.
- Pseudonimização: no cadastro.
- Sincronização simulada: quando a conexão volta.

---

## 4. Estrutura de navegação

### 4.1 Fluxos principais

- Primeiro acesso: Boas-vindas → Cadastro → Pré-teste → Início.
- Acessos seguintes: Login → Início (ou Pré-teste, se ele estiver pendente).
- Estudo: Início ou Trilhas → Trilha → Lição → Quiz → Resultado → próxima lição.
- Fim das trilhas: Resultado da última lição → Teste final liberado → Pós-teste → comparação.
- Administrador: Login → Visão geral → Banco de questões, Parâmetros ou Exportar dados.

### 4.2 Navegação

- Área do jovem: barra de navegação inferior com 5 itens, cada um com ícone e rótulo: Início, Trilhas, Simuladores, Ranking e Perfil. O item ativo fica na cor primária e marcado para leitor de tela.
- Conquistas abrem pelo Perfil e pelo card do Início. Notificações abrem pelo sino no topo.
- Área do administrador: menu lateral fixo com Visão geral, Banco de questões, Parâmetros e Exportar dados, mais Ferramentas de demonstração, Voltar ao app e Sair.
- Filtros: só a alternância Geral / Esta semana no ranking e a busca no banco de questões.

### 4.3 Rotas

| Rota | Tela | Quem acessa | Layout |
|---|---|---|---|
| `/` | T01 Boas-vindas | Visitante | Sem barra |
| `/cadastro` | T02 Cadastro | Visitante | Sem barra |
| `/entrar` | T03 Login | Visitante | Sem barra |
| `/esqueci-senha` | T04 Esqueci minha senha | Visitante | Sem barra |
| `/pre-teste` | T05 Pré-teste | Jovem com pré-teste pendente | Modo foco |
| `/pos-teste` | T06 Pós-teste | Jovem com pré-teste feito | Modo foco |
| `/inicio` | T07 Início | Jovem | Barra inferior |
| `/trilhas` | T08 Trilhas | Jovem | Barra inferior |
| `/trilhas/:trilha` | T09 Trilha | Jovem | Barra inferior |
| `/trilhas/:trilha/licoes/:licao` | T10 Lição | Jovem, com a lição liberada | Modo foco |
| `/trilhas/:trilha/licoes/:licao/quiz` | T11 Quiz | Jovem, com a leitura concluída | Modo foco |
| `/trilhas/:trilha/licoes/:licao/resultado` | T12 Resultado do quiz | Jovem, com o quiz concluído | Modo foco |
| `/simuladores` | T13 Simuladores | Jovem | Barra inferior |
| `/simuladores/juros-compostos` | T14 Juros compostos | Jovem | Barra inferior |
| `/simuladores/cartao-de-credito` | T15 Fatura do cartão | Jovem | Barra inferior |
| `/ranking` | T16 Ranking | Jovem | Barra inferior |
| `/conquistas` | T17 Conquistas | Jovem | Barra inferior |
| `/notificacoes` | T18 Notificações | Jovem | Barra inferior |
| `/perfil` | T19 Perfil | Jovem | Barra inferior |
| `/admin` | T20 Visão geral | Administrador | Menu lateral |
| `/admin/questoes` | T21 Banco de questões | Administrador | Menu lateral |
| `/admin/parametros` | T22 Parâmetros | Administrador | Menu lateral |
| `/admin/exportar` | T23 Exportar dados | Administrador | Menu lateral |
| qualquer outra | T24 Página não encontrada | Todos | Sem barra |

Exemplo de rota real: `/trilhas/juros-compostos/licoes/2/quiz`.

### 4.4 Regras de acesso

1. Sem sessão, qualquer rota interna leva a `/entrar`, guardando a rota pedida para voltar depois do login.
2. Com sessão, `/`, `/entrar`, `/cadastro` e `/esqueci-senha` levam à área do papel.
3. Jovem com pré-teste pendente: qualquer rota da área do jovem leva a `/pre-teste`. Isso cobre as trilhas, como pede o requisito, e também o restante da área, para que nada do conteúdo (inclusive os simuladores) seja visto antes da medição.
4. Jovem tentando abrir `/admin` ou qualquer subrota: volta para `/inicio`, com o toast "Área restrita ao administrador".
5. Administrador tentando abrir uma rota do jovem: volta para `/admin` (para ver o app, ele usa "Voltar ao app").
6. Lição bloqueada aberta pela URL: volta para a trilha, com o aviso de bloqueio.
7. Quiz sem a leitura concluída: volta para a lição. Quiz já concluído: vai para o resultado.
8. Offline, numa trilha não baixada: aviso de conexão no lugar do conteúdo.
9. Pós-teste com as trilhas incompletas: mostra o estado bloqueado (sem redirecionar).

### 4.5 T24 Página não encontrada (apoio – Essencial)

Rota: qualquer rota inexistente.

- Texto "Página não encontrada" e um botão que leva à área do papel (ou às boas-vindas, sem sessão).
- Erro inesperado numa tela: mensagem "Algo deu errado" e o botão Recarregar, sem tela branca.

Critério de aceite: uma URL inexistente mostra a página, e o botão leva ao lugar certo.

---

## 5. Estilo e design

### 5.1 Layout

- Mobile-first, porque a proposta original é um aplicativo de celular.
- Área do jovem: coluna central com até 430 px de largura no desktop, com fundo neutro em volta; topo fixo; barra inferior fixa; margens de 16 px; espaçamento generoso entre cards.
- Área do administrador: layout de desktop, com menu lateral fixo de cerca de 240 px e conteúdo de até 1200 px; abaixo de 1024 px, o menu vira gaveta.
- Cards com cantos arredondados (12 a 16 px) e sombra leve.

### 5.2 Cores

Tema claro como padrão, acolhedor para o público jovem, e tema escuro opcional (no Perfil). As cores ficam como tokens do tema (variáveis CSS do shadcn/ui) e cada uma tem significado fixo:

| Papel | Uso | Sugestão no tema claro |
|---|---|---|
| Primária | Botões principais, links, item ativo da barra | Verde-esmeralda escuro (ex.: `emerald-700`) |
| Acerto | Feedback de resposta certa | Texto verde escuro (ex.: `green-700`) sobre fundo verde bem claro |
| Erro | Resposta errada, validação | Texto vermelho escuro (ex.: `red-700`) sobre fundo vermelho bem claro |
| XP e conquistas | XP, conquistas, destaque do top 3 | Âmbar/dourado (texto `amber-700`; `amber-500` só em ícones com texto ao lado) |
| Sequência | Chama da sequência | Laranja (texto `orange-700`; `orange-500` só no ícone) |
| Neutras | Fundos, bordas, textos secundários | Escala `slate` |

Os tons sugeridos precisam ser conferidos num verificador de contraste: 4,5:1 para texto e 3:1 para ícones e bordas que carregam informação. No tema escuro, usar tons mais claros das mesmas cores, com a mesma conferência.

### 5.3 Tipografia

- Inter, instalada como pacote do projeto (funciona offline, sem depender de fonte externa).
- Números tabulares (`font-variant-numeric: tabular-nums`) em valores em reais, XP, percentuais e tabelas.
- Corpo com 16 px no celular; títulos de 20 a 28 px; um título principal por tela.

### 5.4 Componentes e bibliotecas

- shadcn/ui: Button, Card, Badge, Progress, Tabs ou ToggleGroup (alternâncias), RadioGroup (alternativas), Checkbox, Switch, Input, Textarea, Select, Slider, Dialog, AlertDialog, Sheet, Table, Skeleton, Tooltip, Separator, ScrollArea e Form (com React Hook Form e Zod).
- Toasts: sonner.
- Gráficos: Recharts, sempre dentro de um contêiner responsivo: área (juros compostos) e barras (cartão e visão geral do administrador).
- Ícones: lucide-react, discretos e sempre com rótulo de texto ou rótulo para leitor de tela (ex.: House, BookOpen, Calculator, Trophy, User, Bell, Flame, Lock, CircleCheck, CircleX, WifiOff, Download).
- Nenhuma logo: só o nome do app em texto, "Educação Financeira Gamificada".

### 5.5 Movimento

- Transições suaves de 150 a 250 ms (troca de tela, abrir painéis, reordenar o ranking).
- Celebração discreta, de até 1 s, ao ganhar uma conquista ou concluir uma trilha.
- Sem animação quando o sistema do usuário pede menos movimento (`prefers-reduced-motion`).

### 5.6 Acessibilidade (RNF07)

- Contraste mínimo de 4,5:1 (WCAG 2.1 AA) nos textos e de 3:1 nos ícones e componentes que carregam informação.
- Todo campo com rótulo visível; botões só com ícone têm rótulo para leitor de tela; os gráficos têm um resumo em texto (os resultados numéricos ficam sempre visíveis como texto).
- Foco visível em tudo o que é interativo (anel de 2 px na cor primária) e ordem de foco lógica. Ao trocar de tela, o foco vai para o título.
- Áreas de toque de pelo menos 44 × 44 px.
- Feedback do quiz, toasts e banner offline anunciados ao leitor de tela.
- Nenhuma informação só pela cor: acerto, erro, status, bloqueio e nível sempre têm ícone e texto.
- Teclado: 1 a 4 para escolher a alternativa e Enter para confirmar no quiz e nos testes; Enter para calcular nos simuladores; Esc fecha diálogos e painéis.
- Documento com `lang="pt-BR"`.

### 5.7 Linguagem e formatos

- Tudo em português do Brasil, com frases curtas e "você".
- Todo termo financeiro vem explicado na primeira vez em que aparece.
- Textos sem marcação de gênero sempre que possível (ex.: "Boas-vindas", "Agradecemos por responder").
- Moeda: R$ 1.234,56. Datas: dd/mm/aaaa. Horas: HH:MM. Fuso: America/Sao_Paulo (date-fns, `@date-fns/tz` e o locale ptBR).
- Percentuais com vírgula: "10,00%" nos simuladores, "33%" nos testes e "+67 p.p." nas diferenças.
- Campos em reais com máscara (a digitação preenche a partir dos centavos) e teclado numérico no celular.

---

## 6. Sobre os dados

### 6.1 Tipos (espelham as classes do projeto)

Tipos TypeScript em `src/dados/tipos.ts`, com campos em camelCase. Na etapa 2, a camada de dados converte as colunas do banco (snake_case) para estes tipos.

| Tipo | Campos principais | Observações |
|---|---|---|
| `Usuario` | id, nome, email, papel (jovem ou admin), xpTotal, diasStreak, ultimoDiaUso, ultimaAtividadeEm, receberLembretes, tcleVersao, tcleAceitoEm, privacidadeAceitaEm, maioridadeDeclaradaEm, criadoEm | notaPreTeste e notaPosTeste do diagrama passam a ser calculadas a partir de TesteDiagnostico; senhaHash não existe nesta etapa |
| `Administrador` | Usuario com papel admin | nivelAcesso do diagrama vira o papel |
| `Trilha` | id, slug, titulo, descricao, categoria, ordem | |
| `Licao` | id, trilhaId, ordem (1 a 3), titulo, tempoLeituraMin, conteudo (blocos de texto, exemplo e resumo) | disponivelOffline do diagrama vira estado do aparelho (trilhas baixadas) |
| `Quiz` | id, licaoId, tipoAvaliacao (adaptativo), numeroQuestoes (3) | um por lição |
| `Questao` | id, quizId, enunciado, alternativas (4), respostaCorreta (0 a 3), nivelDificuldade (facil, medio ou dificil), explicacao, ativa, criadoEm, atualizadoEm | pertence ao quiz de uma lição, como no diagrama (Licao 1 — 1 Quiz 1 — N Questao); a lição e a trilha vêm pelo quiz |
| `RespostaQuiz` | id, usuarioId, quizId, questaoId, trilhaId, nivelQuestao, alternativaMarcada, acertou, xpGanho, nivelTrilhaApos, respondidaEm | histórico usado pela janela do motor |
| `Progresso` | id, usuarioId, trilhaId, licaoId, leituraConcluidaEm, quizConcluidoEm, acertos, xpGanho, sincronizadoOffline | um por jovem e lição; nível atual, taxa de acertos e último acesso por trilha são calculados (tipo derivado ProgressoTrilha) |
| `Simulacao` | id, usuarioId, tipoSimulacao (juros_compostos ou cartao_credito), parametros, resultadoFinal, criadaEm | parametros guarda valorInicial, aporteMensal, taxaJuros e prazoMeses (juros) ou fatura, mínimo, taxas e parcelas (cartão) |
| `Badge` | id (código), nome, criterioMarco, icone, ordem | |
| `UsuarioBadge` | usuarioId, badgeId, conquistadoEm | par único; não duplica |
| `Notificacao` | id, usuarioId, tipo (lembrete, conquista ou sistema), mensagem, link, dataEnvio, lida | |
| `TesteDiagnostico` | id, pseudonimo, tipoTeste (pre ou pos), forma (A ou B), versao, iniciadoEm, concluidoEm, pontuacaoTotal | dataAplicacao do diagrama = concluidoEm; ligado ao pseudônimo, nunca ao nome nem ao e-mail |
| `PerguntaDiagnostica` | id, forma, versao, numero (1 a 3), enunciado, alternativas, alternativaCorreta | |
| `RespostaTeste` | id, testeId, perguntaId, alternativaMarcada, acertou, respondidaEm | |
| `ParametroSistema` | id, chave, valor, alteradoPor, alteradoEm | cada alteração é uma nova linha (histórico) |

As classes MotorAdaptativo e Ranking do diagrama viram funções puras em `src/regras/`. Fora das classes ficam também: a sessão; o mapa usuário → pseudônimo, guardado separado de Usuario para manter a pesquisa longe dos dados de contato; e o estado do aparelho (trilhas baixadas, tema, deslocamento do relógio simulado e liberação de demonstração do pós-teste).

### 6.2 Persistência e relógio

- Um "banco local" no localStorage, numa chave com versão (ex.: `efg:dados:v1`), com todas as coleções acima. Versão diferente ou dado corrompido: restaura os dados de demonstração.
- Sessão e preferências do aparelho (tema, trilhas baixadas, relógio simulado) ficam em chaves separadas.
- Leitura e escrita por funções assíncronas de repositório (`src/dados/repositorios/`), usadas pelas telas com TanStack Query. Uma latência simulada curta (cerca de 300 ms, zero nos testes) exercita os skeletons. Na etapa 2, só a implementação dos repositórios muda.
- Se o localStorage não estiver disponível (ex.: navegação privada bloqueada), o app funciona em memória e avisa: "Seu progresso não será salvo neste navegador."
- Relógio: as regras recebem "agora" como parâmetro. O app usa uma função `agora()` (em `src/lib/relogio.ts`) que soma o deslocamento do relógio simulado.
- Datas dos dados de demonstração são relativas ao momento em que os dados são criados ou reiniciados (D0 = hoje; D−1 = ontem), para a demonstração funcionar em qualquer dia.

### 6.3 Usuários de demonstração

Todos fictícios. E-mails no domínio reservado `exemplo.test`, que nunca é real.

| Nome (fictício) | No ranking | XP total | XP da semana | Situação | Testes |
|---|---|---|---|---|---|
| Bruna Moreira | Bruna M. | 940 | 85 | Concluiu as 4 trilhas | Pré e pós |
| Caio Ribeiro | Caio R. | 760 | 140 | Concluiu as 4 trilhas | Pré e pós |
| Duda Farias | Duda F. | 590 | 20 | Concluiu as 4 trilhas | Pré e pós |
| Enzo Tavares | Enzo T. | 430 | 0 | Concluiu as 4 trilhas | Pré e pós |
| Gabi Lopes | Gabi L. | 265 | 45 | Concluiu as 4 trilhas | Pré e pós |
| Heitor Santana | Heitor S. | 124 | 60 | Em andamento | Só pré |
| Alex Lima (jovem principal, `alex.lima@exemplo.test`) | Alex L. | 120 | calculado | Ver 6.4 | Só pré |
| Iara Nogueira | Iara N. | 105 | 35 | Em andamento | Só pré |
| João Pires | João P. | 80 | 0 | Em andamento | Só pré |
| Kauã Vasconcelos | Kauã V. | 55 | 25 | Em andamento | Só pré |
| Lara Campos | Lara C. | 30 | 30 | Em andamento | Só pré |
| Mateus Barros | Mateus B. | 10 | 10 | Em andamento | Só pré |

- Administrador: "Admin Demonstração", `admin@exemplo.test`.
- O jovem principal fica em 7º de 12, logo atrás de Heitor (124 XP). Qualquer quiz concluído (no mínimo 6 XP) o faz passar de posição durante a demonstração.
- Para os outros 11 jovens, o XP da semana é um valor fixo. Para o jovem principal, é calculado pelas respostas da semana corrente.
- Só tem pós-teste quem concluiu as 4 trilhas, para os dados ficarem coerentes com a regra.

### 6.4 Histórico do jovem principal

Coerente com o motor adaptativo (RN02) e com as conquistas: nenhum quiz com 3 acertos (sem Gabaritou) e o nível nunca chega a Difícil (sem Desafio Aceito).

| Dia | Atividade | Respostas (nível da questão e resultado) | XP | Nível da trilha depois |
|---|---|---|---|---|
| D−5 | Cadastro (aceites às 19h00) e pré-teste | P1 correta, P2 "Exatamente o mesmo", P3 "Não sei" → 1 de 3 | 0 | — |
| D−4 | Orçamento Pessoal: lição 1 + quiz | Médio acerto, Médio erro, Médio erro | 24 | Médio (janela incompleta) |
| D−3 | Orçamento Pessoal: lição 2 + quiz | Médio acerto; Médio erro; Fácil acerto | 32 | Fácil (desceu na 5ª resposta, com 2 de 5) |
| D−2 | Orçamento Pessoal: lição 3 + quiz | Fácil acerto; Fácil acerto, da lição 1 (subiu para Médio, 4 de 5); Médio erro | 22 | Médio |
| D−1 | Juros Compostos: lição 1 + quiz (última atividade às 20h00) | Médio acerto, Médio erro, Médio acerto | 42 | Médio (janela incompleta) |

Resultado: 120 XP; sequência de 4 dias (D−4 a D−1), ainda valendo hoje; conquistas Primeiro Quiz (D−4) e Primeira Trilha (D−2); Orçamento Pessoal concluída e Juros Compostos em andamento (1 de 3); "Receber lembretes" ligado; Juros Compostos baixada para uso offline (para mostrar o modo offline).

### 6.5 Trilhas e lições

Textos curtos e corretos, com os termos financeiros explicados. A quarta trilha, Inflação e Investimentos, cobre inflação e diversificação, que também são medidas no teste diagnóstico. Os exemplos das lições e as questões dos quizzes não usam os mesmos cenários e números das perguntas do teste.

| Trilha | Lição | Pontos principais | Exemplo prático |
|---|---|---|---|
| Orçamento Pessoal | 1. Para onde vai o seu dinheiro | Renda; gastos fixos e variáveis; anotar os gastos por um mês | Renda de R$ 1.800,00; gastos fixos de R$ 1.050,00 e variáveis de R$ 600,00; sobram R$ 150,00 |
| Orçamento Pessoal | 2. Montando o seu orçamento | Metas e prioridades; a divisão 50/30/20 (necessidades, desejos e guardar) como ponto de partida, ajustável | Com R$ 2.000,00: R$ 1.000,00, R$ 600,00 e R$ 400,00 |
| Orçamento Pessoal | 3. Reserva de emergência | Para que serve; meta de 3 a 6 meses de gastos essenciais; guardar com baixo risco e resgate rápido (liquidez) | Gastos essenciais de R$ 1.200,00: meta de R$ 3.600,00 a R$ 7.200,00; guardando R$ 200,00 por mês, a meta mínima chega em 18 meses, sem contar o rendimento |
| Juros Compostos | 1. Juros simples e juros compostos | Juros sobre juros; diferença entre os dois | R$ 1.000,00 a 1% ao mês por 3 meses: R$ 1.030,00 com juros simples e R$ 1.030,30 com compostos |
| Juros Compostos | 2. O tempo a seu favor | Prazo, aportes mensais e começar cedo | R$ 100,00 por mês a 1% ao mês, com aporte no fim do mês: R$ 1.268,25 em 12 meses e R$ 8.166,97 em 60 meses |
| Juros Compostos | 3. Taxa ao mês e taxa ao ano | Equivalência de taxas; por que não dividir por 12; o CDI como referência da renda fixa | 1% ao mês equivale a 12,68% ao ano, não a 12%; 10% ao ano equivalem a 0,80% ao mês |
| Cartão de Crédito | 1. Como funciona a fatura | Limite, fechamento e vencimento; pagar o total evita juros | Compras de R$ 800,00 até o fechamento; pagando R$ 800,00 no vencimento, os juros são R$ 0,00 |
| Cartão de Crédito | 2. Mínimo e rotativo | Pagar só o mínimo leva o restante ao rotativo, que só dura até a próxima fatura; juros altos | Fatura de R$ 1.000,00 e mínimo de R$ 150,00: R$ 850,00 no rotativo a 15% ao mês viram R$ 977,50 na fatura seguinte |
| Cartão de Crédito | 3. Parcelamento e teto dos juros | Parcelas iguais (tabela Price); teto de 100% (Lei nº 14.690/2023); CET (custo efetivo total) | R$ 977,50 em 12 parcelas a 9% ao mês: parcelas de R$ 136,51 e cerca de R$ 1.638 no total, ou seja, uns R$ 788 de juros sobre os R$ 850 que ficaram em aberto |
| Inflação e Investimentos | 1. O que é inflação | Aumento geral dos preços; poder de compra; IPCA, o índice oficial de inflação do Brasil, medido pelo IBGE | Compras de R$ 500,00, com inflação de 5% ao ano, passam a custar R$ 525,00 um ano depois |
| Inflação e Investimentos | 2. Rendimento real | Comparar rendimento e inflação; ganho real ≈ rendimento − inflação (conta exata: (1 + rendimento) ÷ (1 + inflação) − 1) | Aplicação de 8% ao ano com inflação de 5%: ganho real de cerca de 2,86% ao ano; rendendo 3% com inflação de 5%, o poder de compra cai cerca de 1,9% |
| Inflação e Investimentos | 3. Diversificação | Não concentrar tudo num único ativo; risco; fundos reúnem vários ativos | R$ 1.000,00 numa única ação que cai 30% viram R$ 700,00; divididos em 5 partes de R$ 200,00, se só uma cair 30%, o total fica em R$ 940,00 |

Cada lição tem de 3 a 5 minutos de leitura, termina com um resumo de 3 ou 4 itens e explica os termos que usa (aporte, montante, CDI, liquidez, rotativo, CET, IPCA, ativo, fundo).

### 6.6 Banco de questões

- 48 questões: 12 por trilha (3 Fácil, 6 Médio e 3 Difícil) e 4 por lição. Todas ativas no início.
- Em todas as trilhas: lição 1 com 1 Fácil e 3 Médio; lição 2 com 1 Fácil, 2 Médio e 1 Difícil; lição 3 com 1 Fácil, 1 Médio e 2 Difícil. Motivo: as 5 primeiras respostas de cada trilha são sempre no Médio (a janela ainda não está cheia), e Fácil e Difícil só são pedidos a partir da 6ª resposta, nas lições 2 e 3.
- Cada uma com enunciado, 4 alternativas, 1 correta, nível e explicação de 1 a 3 frases.
- Fácil: conceito direto. Médio: aplicação com conta simples ou comparação. Difícil: situação em duas etapas ou uma armadilha comum (ex.: dividir a taxa anual por 12; esquecer os juros do rotativo antes do parcelamento).
- Cada questão é sobre o tema da sua lição.
- Nunca repetem as perguntas do teste diagnóstico, nem variações com os mesmos números.
- Contas conferidas: toda questão com cálculo tem o valor certo na alternativa correta.
- Limitação conhecida: com 12 questões por trilha, alguns caminhos ainda usam o "nível mais próximo" (ex.: quem fica no Médio até a lição 3). Isso entra nas limitações do artigo; o banco cresce pela tela T21, sem mudar código.

### 6.7 Dados da pesquisa (fictícios)

- Os 12 jovens da tabela 6.3 são os 12 participantes pseudonimizados (pseudônimos no formato P-7F3A, únicos). O do jovem principal fica só no mapa separado de pseudônimos.
- Os 12 têm pré-teste (Forma A, versão 1.0); os 5 que concluíram as 4 trilhas têm pós-teste (Forma B, versão 1.0). Datas coerentes: o pré antes da primeira lição e o pós depois da última.
- Notas variadas de 0 a 3, com a maioria melhorando, alguns iguais e pelo menos um piorando, para a visão geral não parecer artificial.
- Esses números servem só para mostrar as telas e o CSV. Nunca entram no artigo, nos slides ou na documentação como resultado.

### 6.8 Notificações, parâmetros e conquistas iniciais

Notificações do jovem principal:

1. Conquista: "Você ganhou a conquista Primeira Trilha!" — D−2, lida.
2. Sistema: "Nova trilha disponível: Inflação e Investimentos." — D−3, lida.
3. Sistema: "Faltam 3 dias para a conquista Sequência de 7 dias. Continue estudando!" — D−1, não lida.

Parâmetros: limite de inatividade de 48 h, janela de 5 respostas, limiar de subida de 80% e de descida de 40%, com o autor "Sistema (valor padrão)".

Conquistas: as 6 da tabela de 2.10.

### 6.9 Roteiro sugerido para a demonstração

1. Login → "Entrar como jovem": Início com 120 XP, sequência de 4 dias e 7º lugar.
2. Juros Compostos → Lição 2 → "Concluir leitura e fazer o quiz": a sequência passa a 5 dias.
3. Quiz: acertar as 3 questões. Depois da segunda, aparece "Mandou bem!" (Médio → Difícil) e a terceira vem do nível Difícil. Resultado: +75 XP, Gabaritou e Desafio Aceito, e o ranking passa para 195 XP e 6º lugar.
4. Simuladores: juros compostos com o caso de aceite (R$ 2.395,08) e cartão com o teto legal aplicado.
5. Opcional, modo offline: DevTools → Network → Offline; Juros Compostos (baixada) abre e Cartão de Crédito mostra o aviso de conexão; ao voltar a conexão, aparece o toast de sincronização.
6. Perfil → "Simular 48 h sem acesso": a sequência zera e chega o lembrete (toast e sino).
7. Perfil → "Liberar o pós-teste" → pós-teste → comparação com o pré.
8. "Entrar como administrador": visão geral (já com o novo pós-teste), inativar uma questão, mudar um parâmetro e baixar o CSV para abrir no Excel.
9. "Reiniciar dados de demonstração" ao final.

---

## 7. Observações importantes

### 7.1 Fora do escopo nesta etapa

- Backend, tabelas, autenticação real e APIs.
- Notificação push real (o lembrete é dentro do app).
- Sincronização offline real (ela é simulada).
- Ranking processado em servidor.
- Atualização automática do CDI (a taxa sugerida é um valor de exemplo).
- Imposto de Renda e IOF nos simuladores; multa e juros de mora no cartão.

### 7.2 Organização do código

- `src/regras/`: regras de negócio em funções puras, sem React e sem ler o relógio por conta própria (recebem "agora"), com testes em Vitest ao lado:
  - `simuladores.ts`: `TAXA_SUGERIDA`, `taxaMensalEquivalente`, `calcularMontante`, evolução mês a mês, `simularFatura`.
  - `motorAdaptativo.ts`: `proximoNivel`, `selecionarProximaQuestao`.
  - `gamificacao.ts`: `xpPorResposta`, `verificarConquistas`, `montarRanking`.
  - `sequencia.ts`: `diaDeUso`, `atualizarSequencia`, `sequenciaAtual`, `deveGerarLembrete`.
- `src/dados/`: tipos, dados de demonstração, banco local e repositórios.
- `src/lib/`: formatação (moeda, datas e fuso), relógio e geração do CSV.
- `src/hooks/`: hooks de dados e de sessão (ex.: `useProgresso`, `useSessao`).
- `src/components/`: componentes do app; `src/components/ui/` fica com os componentes do shadcn/ui.
- `src/pages/`: uma pasta por área (publico, jovem, admin).
- Rotas carregadas sob demanda (a área do administrador e os simuladores, que usam Recharts), para a primeira tela abrir rápido.

### 7.3 Regras de negócio e testes

Os nomes dos testes citam o código do requisito (ex.: "RN01: 1.000 + 100/mês a 1% em 12 meses = 2.395,08").

- Simuladores: os casos de aceite de 2.7 e 2.8; equivalência de taxas; prazo em anos; taxa 0; mínimo maior ou igual à fatura; parcelamento com taxa 0; teto aplicado e não aplicado; soma da evolução mês a mês.
- Motor: começa em Médio; não ajusta com menos respostas que a janela; 4 de 5 sobe, 3 de 5 mantém, 2 de 5 desce; limites em Fácil e Difícil; janela deslizante; outros parâmetros (ex.: janela 3 e limiares 70% e 30%); seleção (só da lição atual e das anteriores, preferência pela lição atual, nível atual, só ativas, só não respondidas, nível mais próximo, desempate para o mais fácil, repetição no caso extremo, nada repetido no mesmo quiz); o histórico do jovem principal (6.4) e o passo 3 do roteiro (6.9) reproduzidos pelo motor com os dados de demonstração; perfis sintéticos determinísticos, com padrões que se repetem, de 30% de acerto (desce), 60% (mantém) e 90% (sobe).
- XP: 10, 20 e 35 por acerto e 2 por erro, pelo nível da questão.
- Conquistas: cada critério e a não duplicação.
- Ranking: ordem, empates, semana corrente no fuso e só jovens.
- Sequência e lembrete: atividade às 22h30 de Brasília (01h30 UTC do dia seguinte) conta para o dia de Brasília; dias consecutivos; zera depois de um dia inteiro sem uso; inatividade acima do limite; opção desligada; trilha iniciada; um lembrete por período.
- Formatos e CSV: "R$ 1.234,56", "dd/mm/aaaa", BOM, ponto e vírgula, CRLF e aspas.

Para o artigo: os números da validação técnica (casos conferidos em planilha, perfis sintéticos) só podem ser preenchidos com o que os testes e uma conferência independente em planilha mostrarem. Os valores deste PRD são critérios de aceite, não resultados.

### 7.4 Microinterações e atalhos

- Toasts: "+20 XP", "Trilha disponível offline", "Conexão de volta. Progresso sincronizado.", lembrete, "Questão salva", "Parâmetros salvos. O quiz já usa os novos valores."
- Estados vazios: simulações, notificações, busca sem resultado, visão geral sem pós-testes.
- Skeletons nas listas e nos cards enquanto os dados carregam.
- Atalhos: 1 a 4 e Enter no quiz e nos testes; Enter para calcular nos simuladores; Esc fecha diálogos.
- Dica de teclado só no desktop: "Use as teclas 1 a 4 e Enter".

### 7.5 Decisões deste PRD e pendências

Decisões confirmadas na revisão de 01/11/2026:

1. Enquanto o pré-teste estiver pendente, toda a área do jovem leva a ele, e não só as trilhas (4.4, regra 3). Assim ninguém usa os simuladores antes da medição inicial.
2. Desempate do "nível mais próximo": o mais fácil; e, no caso extremo de tudo já respondido, repete a questão respondida há mais tempo (2.5).
3. O ranking mostra o primeiro nome e a inicial do sobrenome (2.9).
4. No cartão, a primeira parcela vem um mês depois do mês no rotativo e, com o teto, a tabela usa a taxa efetiva (2.8).
5. "Esta semana" vai de segunda a domingo, no fuso de São Paulo (2.9).
6. "Não sei" conta como não acerto (2.2).
7. Na etapa 1 o login não confere a senha, que não é guardada (2.1).
8. No gráfico da visão geral do administrador, só entram os participantes com os dois testes, para comparar as mesmas pessoas no pré e no pós (T20).
9. Cada questão pertence a uma lição, como no diagrama de classes (cada Lição tem 1 Quiz, que agrega as suas Questões). O quiz de uma lição sorteia entre as questões da lição atual e das anteriores da mesma trilha, nunca das seguintes (2.5). A regra de limiar da RN02 não muda.
10. O banco tem 3 Fácil, 6 Médio e 3 Difícil por trilha, distribuídos por lição (6.6). As 5 primeiras respostas de cada trilha são sempre no Médio, e Fácil e Difícil só aparecem a partir da 6ª. O "nível mais próximo" ainda acontece em alguns caminhos: fica registrado como limitação no artigo, e o banco cresce pela tela T21.
11. Prioridades: RF06 (XP) tem prioridade Essencial, porque Atribuir XP é `<<include>>` de Realizar Quiz e acontece em toda resposta. RF07 (ranking) e RF08 (conquistas) têm prioridade Importante: Conceder Badge é `<<extend>>`, ou seja, condicional, e o ranking depende do XP (1.6).
12. O modelo de dados mantém as classes novas (RespostaQuiz, PerguntaDiagnostica, RespostaTeste, ParametroSistema e a associação UsuarioBadge), porque o orientador pediu as respostas por pergunta, com versão e datas. As notas dos testes saem de Usuario e ficam em TesteDiagnostico.pontuacaoTotal, que já existe no diagrama, ligadas só ao pseudônimo.

Pendências que não bloqueiam a construção:

1. Texto oficial do TCLE e da política de privacidade: o app usa um texto provisório, marcado como tal, até a avaliação do CEP. Sem o texto oficial, não há coleta com participantes reais (8.8).
2. Valor real do CDI anualizado base 252 e a data de referência (RN06): até lá, o app usa 10% ao ano, marcado na tela como valor de exemplo.
3. Atualizar a documentação do TCC: o diagrama de classes (decisão 12), RF06 a RF08 na seção 2.1 com as prioridades da decisão 11, e a seleção por lição (decisão 9) nos fluxos do quiz e no artigo.

### 7.6 Ordem de construção

Passos pequenos, um de cada vez, cada um testável ao fim. Primeiro o Essencial, depois o Importante, por último o Desejável. Se faltar tempo, parar ao fim de qualquer passo deixa o app utilizável.

| Passo | O que construir | Prioridade | Pronto quando |
|---|---|---|---|
| 1 | Base do projeto: Vite, React, TypeScript, Tailwind, shadcn/ui com os tokens de 5.2, Inter, tema claro e escuro, React Router com todas as rotas de 4.3 (telas provisórias), os três layouts (jovem, foco e administrador), sonner e Vitest | Essencial | Todas as rotas abrem uma tela provisória; `npm run build` e `npm run test` passam |
| 2 | Formatos (moeda, data, fuso), relógio com deslocamento, tipos de 6.1, dados de demonstração, banco local no localStorage e repositórios com TanStack Query | Essencial | Os dados de demonstração aparecem numa tela provisória e continuam depois de recarregar |
| 3 | Regras dos simuladores, com testes | Essencial | Os critérios numéricos de 2.7 e 2.8 passam no Vitest |
| 4 | T14 Juros compostos e T13 Simuladores | Essencial | Critérios de T13 e T14 atendidos |
| 5 | T15 Fatura do cartão | Essencial | Critérios de T15 atendidos |
| 6 | Sessão simulada, T01 a T04, modais do TCLE e da política, regras de acesso de 4.4 e um botão Sair provisório | Essencial | Cadastro, login, atalhos e recuperação de senha funcionam; rotas protegidas |
| 7 | T08 Trilhas, T09 Trilha e T10 Lição, com o conteúdo das 12 lições e o bloqueio sequencial | Essencial | Critérios de T08 a T10 atendidos (sem o offline) |
| 8 | Regras do motor, do XP e da sequência, com testes | Essencial | Os testes de 7.3 para motor, XP e sequência passam |
| 9 | T11 Quiz e T12 Resultado, com o banco de 48 questões | Essencial | Critérios de T11 e T12 atendidos (conquistas no passo 14) |
| 10 | T07 Início e o topo (XP, sequência, sino) | Essencial | Critérios de T07 atendidos para trilhas, simuladores e topo |
| 11 | Modo offline simulado | Essencial | Critérios do modo offline atendidos |
| 12 | T05 Pré-teste, com registro por pergunta e pseudônimo | Importante | Critérios de T05 atendidos |
| 13 | T06 Pós-teste e os testes no Perfil | Importante | Critérios de T06 atendidos |
| 14 | Conquistas: regras, T17 e o modal | Importante | Critérios de T17 e o item 3 de T12 atendidos |
| 15 | T16 Ranking | Importante | Critérios de T16 atendidos |
| 16 | T19 Perfil completo e as ferramentas de demonstração | Essencial (Sair e termos) e apoio à demonstração | Critérios de T19 atendidos |
| 17 | Layout do administrador e T20 Visão geral | Importante | Critérios de T20 atendidos |
| 18 | T21 Banco de questões | Importante | Critérios de T21 atendidos |
| 19 | T23 Exportar dados | Importante | Critérios de T23 atendidos; o CSV abre no Excel |
| 20 | Lembretes e T18 Notificações | Desejável | Critérios de T18 e dos lembretes atendidos |
| 21 | T22 Parâmetros, com histórico | Desejável | Critérios de T22 atendidos |
| 22 | Revisão final: acessibilidade (5.6), estados vazios e de carregamento, textos, T24, os critérios de aceite de todas as telas, o roteiro de 6.9 e a publicação do build | Todas | O roteiro de demonstração roda do começo ao fim sem erro |

---

## 8. Apêndice — Modelo de dados para a etapa 2

Nada disto é implementado agora. É o modelo que vai substituir os dados de demonstração no Supabase (PostgreSQL, Auth e RLS), seguindo as classes do item 6. Nomes em português, snake_case e no plural.

### 8.1 Autenticação e papéis

- Supabase Auth com e-mail e senha. O hash da senha é feito pelo próprio Supabase (atende ao RNF04) e a recuperação de senha é por e-mail.
- Cada conta ganha uma linha em `usuarios`, criada pelo trigger `handle_new_user` com o papel `'jovem'::papel_usuario`. Os aceites chegam junto com o cadastro, e o trigger grava a data e a hora do servidor.
- O papel `admin` é dado manualmente, por SQL. Não existe cadastro de administrador pela tela.
- `is_admin()` é `security definer` de propósito, para evitar recursão de RLS.
- Tipos enumerados: `papel_usuario` (jovem, admin), `nivel_dificuldade` (facil, medio, dificil), `tipo_teste` (pre, pos), `forma_teste` (A, B), `tipo_simulacao` (juros_compostos, cartao_credito) e `tipo_notificacao` (lembrete, conquista, sistema).

### 8.2 Tabelas

| Tabela | Campos principais | Chaves e regras |
|---|---|---|
| `usuarios` | `id`, `nome`, `papel`, `xp_total`, `dias_streak`, `ultimo_dia_uso` (date, no fuso de São Paulo), `ultima_atividade_em`, `receber_lembretes`, `tcle_versao`, `tcle_aceito_em`, `privacidade_aceita_em`, `maioridade_declarada_em`, `criado_em` | PK `id` = `auth.users.id`; e-mail e senha ficam só em `auth.users` |
| `trilhas` | `id`, `slug`, `titulo`, `descricao`, `categoria`, `ordem` | `slug` único |
| `licoes` | `id`, `trilha_id`, `ordem` (1 a 3), `titulo`, `conteudo` (jsonb com os blocos), `tempo_leitura_min` | FK `trilhas`; único (`trilha_id`, `ordem`) |
| `quizzes` | `id`, `licao_id`, `tipo_avaliacao`, `numero_questoes` (3) | FK `licoes`, um por lição |
| `questoes` | `id`, `quiz_id`, `enunciado`, `alternativas` (text[] com 4 itens), `resposta_correta` (0 a 3), `nivel_dificuldade`, `explicacao`, `ativa`, `criado_por`, `criado_em`, `atualizado_em` | FK `quizzes` (a lição e a trilha vêm pelo quiz) e `usuarios`; sem DELETE: só `ativa = false` |
| `respostas_quiz` | `id`, `usuario_id`, `quiz_id`, `questao_id`, `trilha_id`, `nivel_questao`, `alternativa_marcada`, `acertou`, `xp_ganho`, `nivel_trilha_apos`, `respondida_em` | FKs; único (`usuario_id`, `quiz_id`, `questao_id`); índice (`usuario_id`, `trilha_id`, `respondida_em` desc) para a janela do motor |
| `progresso` | `id`, `usuario_id`, `trilha_id`, `licao_id`, `leitura_concluida_em`, `quiz_concluido_em`, `acertos`, `xp_ganho`, `sincronizado_offline` | Único (`usuario_id`, `licao_id`) |
| `simulacoes` | `id`, `usuario_id`, `tipo_simulacao`, `parametros` (jsonb), `resultado_final` (numeric), `criada_em` | FK `usuarios` |
| `badges` | `id`, `codigo`, `nome`, `descricao`, `criterio_marco`, `icone`, `ordem` | `codigo` único |
| `usuario_badges` | `usuario_id`, `badge_id`, `conquistado_em` | PK (`usuario_id`, `badge_id`): a conquista nunca duplica |
| `notificacoes` | `id`, `usuario_id`, `tipo`, `mensagem`, `link`, `data_envio`, `lida` | FK `usuarios` |
| `testes_diagnosticos` | `id`, `pseudonimo`, `tipo_teste`, `forma`, `versao`, `iniciado_em`, `concluido_em`, `pontuacao_total` (0 a 3) | Sem `usuario_id`; único (`pseudonimo`, `tipo_teste`); pré só com a Forma A e pós só com a B |
| `perguntas_diagnosticas` | `id`, `forma`, `versao`, `numero` (1 a 3), `enunciado`, `alternativas`, `alternativa_correta` | Único (`forma`, `versao`, `numero`) |
| `respostas_teste` | `id`, `teste_id`, `pergunta_id`, `alternativa_marcada`, `acertou`, `respondida_em` | FKs; único (`teste_id`, `pergunta_id`) |
| `parametros_sistema` | `id`, `chave` (limite_inatividade_horas, janela_motor, limiar_subida, limiar_descida), `valor`, `alterado_por`, `alterado_em` | Só INSERT: cada alteração é uma linha, com autor e data |

Datas em `timestamptz` (UTC no banco). Dia de uso e semana do ranking calculados com `at time zone 'America/Sao_Paulo'`.

### 8.3 Relacionamentos

- `usuarios` 1 — N `progresso`, `respostas_quiz`, `simulacoes`, `notificacoes` e `usuario_badges`.
- `trilhas` 1 — N `licoes` (3); `licoes` 1 — 1 `quizzes`; `quizzes` 1 — N `questoes` (4 por lição no início).
- `quizzes` e `questoes` 1 — N `respostas_quiz`.
- `usuarios` N — N `badges`, pela tabela `usuario_badges`.
- `testes_diagnosticos` 1 — N `respostas_teste`; `perguntas_diagnosticas` 1 — N `respostas_teste`.
- `testes_diagnosticos` se liga ao participante só pelo pseudônimo, sem chave estrangeira para `usuarios`.
- `usuarios` (administrador) 1 — N `parametros_sistema` e `questoes` (autor).

### 8.4 Views e funções previstas

- `ranking` (view ou RPC): só o nome de exibição, `xp_total` e o XP da semana (RNF04).
- `progresso_trilhas` (view): status, lições concluídas, nível atual (o `nivel_trilha_apos` da última resposta na trilha, ou Médio) e taxa de acertos da janela. Substitui os atributos nivelAtual, taxaAcertos e dataUltimoAcesso da classe Progresso.
- `parametros_atuais` (view): o valor mais recente de cada chave.
- `proxima_questao` e `responder_questao`: rodam no servidor (RPC `security definer` ou Edge Function que reaproveita `src/regras/`). O cliente nunca recebe a resposta correta antes de responder e nunca grava XP diretamente.
- `concluir_leitura`: registra a leitura e atualiza a sequência e a última atividade.
- `registrar_resposta_teste` e `meus_testes`: calculam o pseudônimo no servidor; o jovem vê só a própria nota.
- `metricas_pesquisa` e `exportar_respostas_testes`: só para o administrador e só com o pseudônimo.
- Lembretes: uma rotina diária (`pg_cron`) ou uma checagem no login gravando em `notificacoes`. O push real fica para depois.

### 8.5 Segurança (RLS)

- RLS ligada em todas as tabelas. A anon key é pública por design; quem protege é a RLS. A chave `service_role` nunca vai para o front.
- Jovem: lê e altera só as próprias linhas (`usuario_id = auth.uid()`); só lê trilhas, lições, quizzes e conquistas; não lê diretamente as respostas corretas de `questoes` nem de `perguntas_diagnosticas` (usa as funções acima).
- Administrador: cria, edita e inativa `questoes` (sem DELETE); só insere em `parametros_sistema`; lê testes e respostas pelo pseudônimo.
- Ninguém lê nome ou e-mail de outra pessoa.

### 8.6 Pseudonimização da pesquisa (RNF06)

- `pseudonimo` = "P-" + 8 caracteres hexadecimais de um HMAC-SHA-256 do id do usuário, com um segredo guardado no Supabase Vault (o "hash com sal" do artigo). Oito caracteres em vez de quatro tornam a colisão praticamente impossível.
- Funções que usam `pgcrypto` precisam de `set search_path = public, extensions`.
- `testes_diagnosticos` e `respostas_teste` guardam só o pseudônimo. Nome e e-mail ficam em `usuarios` e `auth.users`, e o administrador não tem como ligar um ao outro.
- O CSV usa só o pseudônimo: sem nome, sem e-mail, ponto e vírgula, UTF-8 com BOM.

### 8.7 Mapa das classes

- Administrador → `usuarios` com papel `admin` (nivelAcesso → `papel`).
- MotorAdaptativo e Ranking → funções em `src/regras/` e as funções e views de 8.4; não viram tabelas.
- Usuario.notaPreTeste e notaPosTeste → calculadas de `testes_diagnosticos`, para separar a pesquisa dos dados de contato.
- Licao.disponivelOffline → estado do aparelho, fora do banco.
- RespostaQuiz, PerguntaDiagnostica, RespostaTeste, ParametroSistema e a associação UsuarioBadge → tabelas próprias.

### 8.8 Antes da coleta com participantes reais

- Criar o projeto Supabase de produção, separado do de desenvolvimento e demonstração. Todo SQL roda primeiro no de desenvolvimento.
- Remover os atalhos de login e as ferramentas de demonstração (relógio simulado, "Liberar o pós-teste", "Reiniciar dados"), ou restringi-los ao administrador.
- Na produção, os dados iniciais trazem só conteúdo (trilhas, lições, questões, conquistas, perguntas diagnósticas e parâmetros). Nenhum participante fictício.
- Trocar o texto provisório do TCLE e da política de privacidade pelo texto aprovado no CEP.
- Trocar o CDI de exemplo pelo valor real, com a data de referência.
