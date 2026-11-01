-- RF10: o administrador lista, cria, edita e inativa questões (nunca exclui), com as proteções do PRD T21.

create or replace function public.admin_listar_questoes()
returns table (id text, quiz_id text, trilha_id text, licao_id text, licao_ordem smallint, enunciado text, alternativas text[],
               resposta_correta smallint, nivel_dificuldade public.nivel_dificuldade, explicacao text, ativa boolean,
               criado_em timestamptz, atualizado_em timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not privado.is_admin() then raise exception 'Área restrita ao administrador'; end if;
  return query
  select q.id, q.quiz_id, l.trilha_id, l.id, l.ordem, q.enunciado, q.alternativas, q.resposta_correta, q.nivel_dificuldade,
         q.explicacao, q.ativa, q.criado_em, q.atualizado_em
  from public.questoes q
  join public.quizzes qz on qz.id = q.quiz_id
  join public.licoes l on l.id = qz.licao_id
  order by l.trilha_id, l.ordem, q.nivel_dificuldade, q.id;
end;
$$;

create or replace function public.admin_salvar_questao(
  p_id text, p_quiz_id text, p_enunciado text, p_alternativas text[], p_resposta_correta smallint,
  p_nivel public.nivel_dificuldade, p_explicacao text, p_ativa boolean)
returns text
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_id text;
begin
  if not privado.is_admin() then raise exception 'Área restrita ao administrador'; end if;
  if cardinality(p_alternativas) <> 4
     or (select count(distinct privado.normalizar_texto(a)) from unnest(p_alternativas) as a) <> 4 then
    raise exception 'As 4 alternativas precisam ser diferentes';
  end if;
  if exists (select 1 from public.perguntas_diagnosticas d where privado.normalizar_texto(d.enunciado) = privado.normalizar_texto(p_enunciado)) then
    raise exception 'Este enunciado é igual a uma pergunta do teste diagnóstico';
  end if;

  if p_id is null then
    insert into public.questoes (quiz_id, enunciado, alternativas, resposta_correta, nivel_dificuldade, explicacao, ativa, criado_por)
    values (p_quiz_id, trim(p_enunciado), p_alternativas, p_resposta_correta, p_nivel, trim(p_explicacao), p_ativa, (select auth.uid()))
    returning id into v_id;
  else
    update public.questoes
    set quiz_id = p_quiz_id, enunciado = trim(p_enunciado), alternativas = p_alternativas, resposta_correta = p_resposta_correta,
        nivel_dificuldade = p_nivel, explicacao = trim(p_explicacao), ativa = p_ativa, atualizado_em = now()
    where id = p_id
    returning id into v_id;
    if v_id is null then raise exception 'Questão não encontrada'; end if;
  end if;

  -- Proteção: o quiz da lição 1 só usa questões dela, então ela precisa de 3 ativas.
  -- O raise exception desfaz a gravação inteira.
  if exists (
    select 1 from public.licoes l join public.quizzes qz on qz.licao_id = l.id
    where l.ordem = 1 and (select count(*) from public.questoes q where q.quiz_id = qz.id and q.ativa) < 3
  ) then
    raise exception 'A lição 1 de cada trilha precisa de pelo menos 3 questões ativas';
  end if;
  return v_id;
end;
$$;

revoke all on function public.admin_listar_questoes() from public, anon;
revoke all on function public.admin_salvar_questao(text, text, text, text[], smallint, public.nivel_dificuldade, text, boolean) from public, anon;
grant execute on function public.admin_listar_questoes() to authenticated;
grant execute on function public.admin_salvar_questao(text, text, text, text[], smallint, public.nivel_dificuldade, text, boolean) to authenticated;
