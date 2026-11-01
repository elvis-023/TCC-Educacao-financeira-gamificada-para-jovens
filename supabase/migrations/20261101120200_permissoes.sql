-- Permissões da Data API (explícitas) e políticas de RLS.
-- O jovem lê só o que é dele; XP, nível, testes e conquistas só mudam pelas funções do servidor.
-- Rodar uma vez, em banco novo: as políticas são criadas com "create policy" (sem "drop policy").

-- ATENÇÃO: o Supabase concede privilégios amplos por padrão a anon e authenticated em tabelas novas, e a RLS só filtra
-- linhas (quem limita colunas é o GRANT). Por isso se revoga também de authenticated; os grants intencionais vêm abaixo
-- e são repetidos em 20261101120500_endurecer_privilegios.sql, que também fecha os padrões para objetos futuros.
revoke all on all tables in schema public from anon, authenticated;

-- Conteúdo: leitura para quem está logado.
grant select on public.trilhas, public.licoes, public.quizzes, public.badges to authenticated;
create policy "conteudo: leitura" on public.trilhas for select to authenticated using (true);
create policy "conteudo: leitura" on public.licoes for select to authenticated using (true);
create policy "conteudo: leitura" on public.quizzes for select to authenticated using (true);
create policy "conteudo: leitura" on public.badges for select to authenticated using (true);

-- Usuário: lê a própria linha e só altera a opção de lembretes.
grant select on public.usuarios to authenticated;
grant update (receber_lembretes) on public.usuarios to authenticated;
create policy "usuarios: ver o próprio" on public.usuarios for select to authenticated
  using ((select auth.uid()) = id);
create policy "usuarios: alterar o próprio" on public.usuarios for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Progresso, respostas do quiz e conquistas: só leitura das próprias.
grant select on public.progresso, public.respostas_quiz, public.usuario_badges to authenticated;
create policy "progresso: ver o próprio" on public.progresso for select to authenticated
  using ((select auth.uid()) = usuario_id);
create policy "respostas_quiz: ver as próprias" on public.respostas_quiz for select to authenticated
  using ((select auth.uid()) = usuario_id);
create policy "usuario_badges: ver as próprias" on public.usuario_badges for select to authenticated
  using ((select auth.uid()) = usuario_id);

-- Simulações: ler e criar as próprias.
grant select, insert on public.simulacoes to authenticated;
create policy "simulacoes: ver as próprias" on public.simulacoes for select to authenticated
  using ((select auth.uid()) = usuario_id);
create policy "simulacoes: criar as próprias" on public.simulacoes for insert to authenticated
  with check ((select auth.uid()) = usuario_id);

-- Notificações: ler as próprias e marcar como lida.
grant select on public.notificacoes to authenticated;
grant update (lida) on public.notificacoes to authenticated;
create policy "notificacoes: ver as próprias" on public.notificacoes for select to authenticated
  using ((select auth.uid()) = usuario_id);
create policy "notificacoes: marcar as próprias" on public.notificacoes for update to authenticated
  using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);

-- Parâmetros: leitura dos valores (não são secretos); autor e histórico só pela função do administrador.
grant select (chave, valor, alterado_em) on public.parametros_sistema to authenticated;
create policy "parametros: leitura" on public.parametros_sistema for select to authenticated using (true);

-- Sem acesso direto, só pelas funções: questoes, perguntas_diagnosticas, testes_diagnosticos e respostas_teste
-- (RLS ligada, nenhuma permissão e nenhuma política).
