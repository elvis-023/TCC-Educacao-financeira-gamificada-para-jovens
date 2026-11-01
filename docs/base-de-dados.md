# Base de dados

Banco **PostgreSQL no Supabase** (Auth, RLS e RPC). Tudo o que existe no banco está em `supabase/migrations/`, em ordem de nome: o esquema, as permissões, o conteúdo (trilhas, lições, questões, perguntas do teste, conquistas) e as funções. **Nenhum dado de usuário é versionado.**

## Como recriar o banco do zero

1. Crie um projeto no Supabase (https://supabase.com/dashboard).
2. No **SQL Editor**, rode os arquivos de `supabase/migrations/` **um por vez, na ordem**:

| # | Arquivo | O que faz |
|---|---|---|
| 1 | `20261101120000_esquema.sql` | Tipos, 15 tabelas, índices e RLS ligada em todas. |
| 2 | `20261101120100_funcoes_base.sql` | Funções auxiliares no schema `privado` (`is_admin`, `parametro`, `pseudonimo_de`), segredo do pseudônimo no Vault e trigger `handle_new_user`. |
| 3 | `20261101120200_permissoes.sql` | `GRANT` explícitos e políticas de RLS. |
| 4 | `20261101120300_conteudo.sql` | Conteúdo: 4 trilhas, 12 lições, 48 questões base, perguntas do teste (Formas A e B), conquistas e parâmetros iniciais. Gerado por `npm run gerar:seed`. |
| 5 | `20261101120400_funcoes_estudo.sql` | RPC de estudo: leitura, quiz adaptativo (RN02, RN03), conquistas (RF08) e teste diagnóstico (RF05). |
| 6 | `20261101120500_endurecer_privilegios.sql` | Revoga os privilégios padrão do Supabase; o jovem não consegue alterar `xp_total` nem `papel`. |
| 7 | `20261101120600_ranking.sql` | RPC `ranking` (só nome de exibição e XP, RNF04). |
| 8 | `20261101120700_admin_pesquisa.sql` | Métricas e exportação do estudo, só para o administrador e só com o pseudônimo (RF12, RNF06). |
| 9 | `20261101120800_admin_questoes.sql` | Banco de questões do administrador: criar, editar e inativar, nunca excluir (RF10). |
| 10 | `20261101120900_lembretes.sql` | Lembrete de inatividade dentro do app (RF09, RN04). |
| 11 | `20261101121000_parametros.sql` | Parâmetros do motor com autor e data de cada alteração (RF11). |
| 12 | `20261101121100_treino.sql` | Modo Treino: tabela `respostas_treino`, RPC e ranking semanal com o XP do treino. |
| 13 | `20261101121200_questoes_novas.sql` | 288 questões novas (o banco passa a ter 336). Gerado por `npm run gerar:seed`. |

3. No painel, em **Authentication**:
   - **URL Configuration**: Site URL e Redirect URLs com a URL do app (Worker) e `http://localhost:5173`.
   - **Sign In / Providers → Email**: desligar "Confirm email" se não houver provedor de e-mail configurado.
4. Preencha o `.env` com a URL do projeto e a chave pública (`anon`) e rode `npm run dev` com `VITE_FONTE_DADOS=supabase`.
5. **Administrador:** cadastre uma conta pelo app e, no SQL Editor, promova-a: `update public.usuarios set papel = 'admin' where id = '<uuid do usuário>';`. A chave `service_role` nunca vai para o front.

## Modelo de dados

Domínio em português, nomes do diagrama de classes.

| Tabela | Guarda |
|---|---|
| `usuarios` | Perfil ligado a `auth.users`: nome, papel (`jovem` ou `admin`), XP, sequência, aceite do TCLE e da política, declaração de 18 anos ou mais (com data e hora). |
| `trilhas`, `licoes`, `quizzes`, `questoes` | Conteúdo. Cada questão pertence a um quiz de uma lição; tem nível (fácil, médio, difícil), resposta correta, explicação e flag de ativa (questão não se exclui, só se inativa). |
| `respostas_quiz` | Cada resposta do quiz: alternativa, acerto, XP e nível da trilha depois. Alimenta o motor adaptativo (últimas 5 por trilha). |
| `progresso` | Por usuário e lição: leitura concluída, quiz concluído, acertos e XP. O nível atual da trilha não é gravado: sai das últimas 5 respostas de `respostas_quiz`. |
| `respostas_treino` | Respostas do Modo Treino, **separadas** do quiz (não mudam nível, conquistas, sequência nem pesquisa). |
| `simulacoes` | Simulações salvas (juros e cartão) com parâmetros e resultado. |
| `badges`, `usuario_badges` | Conquistas e quem as obteve (única por usuário e conquista). |
| `notificacoes` | Lembretes dentro do app. |
| `testes_diagnosticos`, `perguntas_diagnosticas`, `respostas_teste` | Teste pré (Forma A) e pós (Forma B), com **a resposta de cada pergunta**, forma, versão e data. Ligados ao participante só pelo **pseudônimo** (HMAC com segredo no Vault), sem chave estrangeira para `usuarios`. |
| `parametros_sistema` | Janela, limiares e inatividade do motor; cada alteração é uma linha nova com autor e data. |

## Funções (RPC)

Todas `security definer`, com `search_path` vazio, `revoke ... from public, anon` e `grant execute ... to authenticated`.

- Estudo: `concluir_leitura`, `proxima_questao`, `responder_questao`, `estado_treino`, `proxima_questao_treino`, `responder_treino`, `gerar_lembrete`, `ranking`.
- Teste diagnóstico: `iniciar_teste`, `registrar_resposta_teste`, `meus_testes`.
- Administrador: `admin_listar_questoes`, `admin_salvar_questao`, `admin_salvar_parametros`, `admin_historico_parametros`, `metricas_pesquisa`, `exportar_respostas_testes`.
- Auxiliares no schema `privado` (fora da Data API): `is_admin`, `parametro`, `pseudonimo_de`, `pre_teste_concluido`, `registrar_atividade`, `conceder_conquistas`, `nome_de_exibicao`, `normalizar_texto`.

## Segurança

- **RLS ligada em todas as tabelas.** O jovem lê e edita só os próprios dados; as respostas dos testes só o administrador lê, e sempre pelo pseudônimo.
- A RLS filtra linhas; quem limita colunas é o `GRANT`. Por isso `20261101120500` revoga os privilégios padrão.
- `is_admin()` é `security definer` de propósito, para evitar recursão de RLS.
- A chave `anon` é pública por design. A `service_role` não é usada no app.
- O ranking expõe apenas nome de exibição e XP.

## Dados e privacidade

- O projeto Supabase atual é de **desenvolvimento e demonstração**: só contas de teste. Dado real de participante só entra no projeto de produção, criado depois da aprovação do CEP.
- O CSV de exportação (RF12) usa só o pseudônimo: sem nome, sem e-mail, separador `;`, UTF-8 com BOM.

## Conferências

- `npm run auditar:banco`: contagens por nível e lição, duplicatas e viés de tamanho das alternativas.
- `scripts/carga-ranking.sql`: teste de carga da RPC `ranking` com usuários sintéticos (desfeito no final).
- `docs/medicoes.md`: números medidos para a documentação e o artigo.
