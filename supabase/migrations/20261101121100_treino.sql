-- Modo Treino: revisão repetível das lições cujo quiz já foi concluído.
-- As respostas ficam numa tabela à parte: não entram no nível adaptativo, nas conquistas, na sequência nem na pesquisa.
-- XP do treino = 20% do XP do quiz (Fácil 2, Médio 4, Difícil 7), erro não vale XP e o teto é 40 XP por dia (fuso de São Paulo).

create table if not exists public.respostas_treino (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  questao_id text not null references public.questoes (id),
  acertou boolean not null,
  xp_ganho smallint not null default 0 check (xp_ganho between 0 and 7),
  respondida_em timestamptz not null default now()
);
create index if not exists respostas_treino_usuario_idx on public.respostas_treino (usuario_id, respondida_em desc);
create index if not exists respostas_treino_questao_idx on public.respostas_treino (questao_id);

alter table public.respostas_treino enable row level security;
revoke all on public.respostas_treino from anon, authenticated;
grant select on public.respostas_treino to authenticated;
create policy "treino: leitura própria" on public.respostas_treino for select to authenticated using (usuario_id = (select auth.uid()));

create or replace function public.estado_treino()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'questoesDisponiveis', (
      select count(*) from public.questoes q
      join public.quizzes qz on qz.id = q.quiz_id
      join public.progresso p on p.licao_id = qz.licao_id and p.usuario_id = (select auth.uid()) and p.quiz_concluido_em is not null
      where q.ativa),
    'xpHoje', (
      select coalesce(sum(r.xp_ganho), 0) from public.respostas_treino r
      where r.usuario_id = (select auth.uid())
        and (r.respondida_em at time zone 'America/Sao_Paulo')::date = (now() at time zone 'America/Sao_Paulo')::date))
  where (select auth.uid()) is not null;
$$;

create or replace function public.proxima_questao_treino(p_ja_vistas text[] default '{}')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_q record;
begin
  if v_uid is null then raise exception 'Sua sessão expirou. Entre de novo.'; end if;
  select q.id, q.enunciado, q.alternativas, q.nivel_dificuldade into v_q
  from public.questoes q
  join public.quizzes qz on qz.id = q.quiz_id
  join public.progresso p on p.licao_id = qz.licao_id and p.usuario_id = v_uid and p.quiz_concluido_em is not null
  where q.ativa and not (q.id = any (coalesce(p_ja_vistas, '{}')))
  order by (select count(*) from public.respostas_treino r where r.usuario_id = v_uid and r.questao_id = q.id), random()
  limit 1;
  if not found then return null; end if;
  -- A resposta correta não sai daqui: só depois de responder.
  return jsonb_build_object('id', v_q.id, 'enunciado', v_q.enunciado, 'alternativas', to_jsonb(v_q.alternativas), 'nivelDificuldade', v_q.nivel_dificuldade);
end;
$$;

create or replace function public.responder_treino(p_questao_id text, p_alternativa smallint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_q record;
  v_acertou boolean;
  v_base integer;
  v_hoje integer;
  v_xp integer;
  c_teto constant integer := 40;
begin
  if v_uid is null then raise exception 'Sua sessão expirou. Entre de novo.'; end if;
  if p_alternativa is null or p_alternativa not between 0 and 3 then raise exception 'Alternativa inválida'; end if;
  select q.resposta_correta, q.explicacao, q.nivel_dificuldade into v_q
  from public.questoes q
  join public.quizzes qz on qz.id = q.quiz_id
  join public.progresso p on p.licao_id = qz.licao_id and p.usuario_id = v_uid and p.quiz_concluido_em is not null
  where q.id = p_questao_id and q.ativa;
  if not found then raise exception 'Questão indisponível para o treino'; end if;

  v_acertou := p_alternativa = v_q.resposta_correta;
  v_base := case when not v_acertou then 0 else case v_q.nivel_dificuldade when 'facil' then 2 when 'medio' then 4 else 7 end end;
  select coalesce(sum(r.xp_ganho), 0) into v_hoje from public.respostas_treino r
  where r.usuario_id = v_uid and (r.respondida_em at time zone 'America/Sao_Paulo')::date = (now() at time zone 'America/Sao_Paulo')::date;
  v_xp := greatest(0, least(v_base, c_teto - v_hoje));

  insert into public.respostas_treino (usuario_id, questao_id, acertou, xp_ganho) values (v_uid, p_questao_id, v_acertou, v_xp);
  update public.usuarios set xp_total = xp_total + v_xp where id = v_uid;
  return jsonb_build_object('acertou', v_acertou, 'respostaCorreta', v_q.resposta_correta, 'explicacao', v_q.explicacao, 'xpGanho', v_xp, 'xpHoje', v_hoje + v_xp);
end;
$$;

revoke all on function public.estado_treino() from public, anon;
revoke all on function public.proxima_questao_treino(text[]) from public, anon;
revoke all on function public.responder_treino(text, smallint) from public, anon;
grant execute on function public.estado_treino() to authenticated;
grant execute on function public.proxima_questao_treino(text[]) to authenticated;
grant execute on function public.responder_treino(text, smallint) to authenticated;

-- O ranking da semana passa a somar também o XP do treino (o geral já usa xp_total, que o treino atualiza).
create or replace function public.ranking(p_periodo text default 'geral')
returns table (posicao bigint, nome_exibicao text, xp bigint, eh_voce boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with inicio as (
    select (date_trunc('week', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo') as semana
  ), base as (
    select u.id,
           privado.nome_de_exibicao(u.nome) as nome_exibicao,
           (case when p_periodo = 'semana'
              then (select coalesce(sum(r.xp_ganho), 0) from public.respostas_quiz r, inicio i
                    where r.usuario_id = u.id and r.respondida_em >= i.semana)
                 + (select coalesce(sum(t.xp_ganho), 0) from public.respostas_treino t, inicio i
                    where t.usuario_id = u.id and t.respondida_em >= i.semana)
              else u.xp_total
            end)::bigint as xp
    from public.usuarios u
    where u.papel = 'jovem' and (select auth.uid()) is not null
  )
  select rank() over (order by b.xp desc) as posicao, b.nome_exibicao, b.xp, b.id = (select auth.uid()) as eh_voce
  from base b
  order by b.xp desc, b.nome_exibicao;
$$;
revoke all on function public.ranking(text) from public, anon;
grant execute on function public.ranking(text) to authenticated;
