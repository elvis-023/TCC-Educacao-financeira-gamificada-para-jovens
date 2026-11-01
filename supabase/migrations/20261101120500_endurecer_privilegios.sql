-- Correção de segurança achada no teste do E2.7.
-- Este projeto concede privilégios amplos por padrão (default privileges) a anon e authenticated em toda tabela, função
-- e sequência nova. Com isso o jovem podia, por exemplo, atualizar o próprio xp_total (a RLS só filtra linhas; o que limita
-- colunas é o GRANT). Aqui: (1) fecha os padrões para objetos novos; (2) revoga tudo que já existia; (3) reaplica só as
-- permissões intencionais, as mesmas de 20261101120200_permissoes.sql.

alter default privileges for role postgres revoke all on tables from anon, authenticated;
alter default privileges for role postgres revoke all on sequences from anon, authenticated;
alter default privileges for role postgres revoke all on functions from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select on public.trilhas, public.licoes, public.quizzes, public.badges to authenticated;
grant select on public.usuarios to authenticated;
grant update (receber_lembretes) on public.usuarios to authenticated;
grant select on public.progresso, public.respostas_quiz, public.usuario_badges to authenticated;
grant select, insert on public.simulacoes to authenticated;
grant usage on sequence public.simulacoes_id_seq to authenticated;
grant select on public.notificacoes to authenticated;
grant update (lida) on public.notificacoes to authenticated;
grant select (chave, valor, alterado_em) on public.parametros_sistema to authenticated;

-- Sem acesso direto (só pelas funções): questoes, perguntas_diagnosticas, testes_diagnosticos e respostas_teste.
