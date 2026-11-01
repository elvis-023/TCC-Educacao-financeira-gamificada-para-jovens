-- Funções chamadas pelo app: leitura, quiz adaptativo (RN02, RN03), conquistas (RF08) e teste diagnóstico (RF05).
-- Todas conferem auth.uid() e rodam como dono do banco (security definer), validando as regras no servidor.
-- Cada função repete no servidor uma regra que já tem teste em TypeScript (src/regras/).

-- RF08: conquistas verificadas ao concluir um quiz, sem duplicar (mesmos critérios de verificarConquistas).
create or replace function privado.conceder_conquistas(p_usuario uuid, p_gabaritou boolean)
returns text[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_quizzes integer;
  v_trilhas integer;
  v_sequencia integer;
  v_chegou_dificil boolean;
  v_novas text[];
begin
  select count(*) into v_quizzes from public.progresso where usuario_id = p_usuario and quiz_concluido_em is not null;
  select count(*) into v_trilhas from (
    select trilha_id from public.progresso
    where usuario_id = p_usuario and quiz_concluido_em is not null
    group by trilha_id having count(*) >= 3
  ) t;
  select dias_streak into v_sequencia from public.usuarios where id = p_usuario;
  select exists (select 1 from public.respostas_quiz where usuario_id = p_usuario and nivel_trilha_apos = 'dificil') into v_chegou_dificil;

  with candidatas as (
    select unnest(array_remove(array[
      case when v_quizzes >= 1 then 'primeiro_quiz' end,
      case when v_trilhas >= 1 then 'primeira_trilha' end,
      case when v_sequencia >= 7 then 'sequencia_7_dias' end,
      case when p_gabaritou then 'gabaritou' end,
      case when v_chegou_dificil then 'desafio_aceito' end,
      case when v_trilhas >= 4 then 'mestre_das_financas' end
    ], null)) as badge_id
  ), inseridas as (
    insert into public.usuario_badges (usuario_id, badge_id)
    select p_usuario, c.badge_id from candidatas c
    on conflict (usuario_id, badge_id) do nothing
    returning badge_id
  )
  select coalesce(array_agg(i.badge_id order by b.ordem), '{}') into v_novas
  from inseridas i join public.badges b on b.id = i.badge_id;

  insert into public.notificacoes (usuario_id, tipo, mensagem, link)
  select p_usuario, 'conquista', 'Você ganhou a conquista ' || b.nome || '!', '/conquistas'
  from public.badges b where b.id = any (v_novas);

  if 'mestre_das_financas' = any (v_novas) then
    insert into public.notificacoes (usuario_id, tipo, mensagem, link)
    values (p_usuario, 'sistema', 'Teste final liberado! Faça agora para ver a sua evolução.', '/pos-teste');
  end if;
  return v_novas;
end;
$$;

-- RF02: leitura concluída (só a primeira conta); exige o pré-teste e a lição liberada.
create or replace function public.concluir_leitura(p_licao_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_licao public.licoes%rowtype;
  v_inseridas integer;
begin
  if v_uid is null then raise exception 'Sua sessão expirou. Entre de novo.'; end if;
  if not privado.pre_teste_concluido(v_uid) then raise exception 'Faça o teste inicial antes das trilhas'; end if;
  select * into v_licao from public.licoes where id = p_licao_id;
  if not found then raise exception 'Lição não encontrada'; end if;
  if v_licao.ordem > 1 and not exists (
    select 1 from public.progresso p join public.licoes l on l.id = p.licao_id
    where p.usuario_id = v_uid and l.trilha_id = v_licao.trilha_id and l.ordem = v_licao.ordem - 1 and p.quiz_concluido_em is not null
  ) then
    raise exception 'Conclua a lição anterior para desbloquear';
  end if;
  insert into public.progresso (usuario_id, trilha_id, licao_id, leitura_concluida_em)
  values (v_uid, v_licao.trilha_id, v_licao.id, now())
  on conflict (usuario_id, licao_id) do nothing;
  get diagnostics v_inseridas = row_count;
  if v_inseridas > 0 then
    perform privado.registrar_atividade(v_uid);
  end if;
end;
$$;

-- RN02 (seleção, decisões 2 e 9; mesma regra de grupoPreferido): devolve a próxima questão sem a resposta correta.
create or replace function public.proxima_questao(p_quiz_id text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_trilha text;
  v_ordem smallint;
  v_licao text;
  v_total smallint;
  v_no_quiz integer;
  v_nivel public.nivel_dificuldade;
  v_busca public.nivel_dificuldade[];
  v_n public.nivel_dificuldade;
  v_q record;
begin
  if v_uid is null then raise exception 'Sua sessão expirou. Entre de novo.'; end if;
  select l.trilha_id, l.ordem, l.id, q.numero_questoes into v_trilha, v_ordem, v_licao, v_total
  from public.quizzes q join public.licoes l on l.id = q.licao_id where q.id = p_quiz_id;
  if v_trilha is null then raise exception 'Quiz não encontrado'; end if;
  if not exists (select 1 from public.progresso where usuario_id = v_uid and licao_id = v_licao and leitura_concluida_em is not null) then
    raise exception 'Leia a lição antes do quiz';
  end if;
  select count(*) into v_no_quiz from public.respostas_quiz where usuario_id = v_uid and quiz_id = p_quiz_id;
  if v_no_quiz >= v_total then
    return null;
  end if;

  select coalesce((
    select r.nivel_trilha_apos from public.respostas_quiz r
    where r.usuario_id = v_uid and r.trilha_id = v_trilha
    order by r.respondida_em desc, r.id desc limit 1
  ), 'medio') into v_nivel;
  v_busca := case v_nivel
    when 'facil' then array['facil', 'medio', 'dificil']::public.nivel_dificuldade[]
    when 'medio' then array['medio', 'facil', 'dificil']::public.nivel_dificuldade[]
    else array['dificil', 'medio', 'facil']::public.nivel_dificuldade[]
  end;

  foreach v_n in array v_busca loop
    select q.id, q.enunciado, q.alternativas, q.nivel_dificuldade, l.ordem as licao_ordem into v_q
    from public.questoes q
    join public.quizzes qz on qz.id = q.quiz_id
    join public.licoes l on l.id = qz.licao_id
    where l.trilha_id = v_trilha and l.ordem <= v_ordem and q.ativa and q.nivel_dificuldade = v_n
      and not exists (select 1 from public.respostas_quiz r where r.usuario_id = v_uid and r.questao_id = q.id)
    order by (l.ordem = v_ordem) desc, random()
    limit 1;
    if found then
      return jsonb_build_object('id', v_q.id, 'enunciado', v_q.enunciado, 'alternativas', to_jsonb(v_q.alternativas),
        'nivelDificuldade', v_q.nivel_dificuldade, 'licaoOrdem', v_q.licao_ordem, 'numeroNoQuiz', v_no_quiz + 1, 'totalNoQuiz', v_total);
    end if;
  end loop;

  -- Caso extremo: repete a respondida há mais tempo, nunca uma deste quiz.
  select q.id, q.enunciado, q.alternativas, q.nivel_dificuldade, l.ordem as licao_ordem into v_q
  from public.questoes q
  join public.quizzes qz on qz.id = q.quiz_id
  join public.licoes l on l.id = qz.licao_id
  join lateral (
    select max(r.respondida_em) as ultima from public.respostas_quiz r where r.usuario_id = v_uid and r.questao_id = q.id
  ) u on true
  where l.trilha_id = v_trilha and l.ordem <= v_ordem and q.ativa and u.ultima is not null
    and not exists (select 1 from public.respostas_quiz r where r.usuario_id = v_uid and r.quiz_id = p_quiz_id and r.questao_id = q.id)
  order by u.ultima asc
  limit 1;
  if found then
    return jsonb_build_object('id', v_q.id, 'enunciado', v_q.enunciado, 'alternativas', to_jsonb(v_q.alternativas),
      'nivelDificuldade', v_q.nivel_dificuldade, 'licaoOrdem', v_q.licao_ordem, 'numeroNoQuiz', v_no_quiz + 1, 'totalNoQuiz', v_total);
  end if;
  raise exception 'Não há questões ativas para este quiz';
end;
$$;

-- RN02 (limiar, mesma regra de proximoNivel) e RN03 (XP): corrige, pontua, ajusta o nível e fecha o quiz.
create or replace function public.responder_questao(p_quiz_id text, p_questao_id text, p_alternativa smallint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_trilha text;
  v_ordem smallint;
  v_licao text;
  v_total smallint;
  v_q public.questoes%rowtype;
  v_q_ordem smallint;
  v_q_trilha text;
  v_respondidas integer;
  v_nivel_antes public.nivel_dificuldade;
  v_nivel_depois public.nivel_dificuldade;
  v_acertou boolean;
  v_xp smallint;
  v_janela integer := coalesce(privado.parametro('janela_motor'), 5)::integer;
  v_subida numeric := coalesce(privado.parametro('limiar_subida'), 80);
  v_descida numeric := coalesce(privado.parametro('limiar_descida'), 40);
  v_acertos_janela integer;
  v_total_janela integer;
  v_taxa numeric;
  v_quiz_concluido boolean := false;
  v_acertos_quiz integer := 0;
  v_xp_quiz integer := 0;
  v_trilha_concluida boolean := false;
  v_novas text[] := '{}';
begin
  if v_uid is null then raise exception 'Sua sessão expirou. Entre de novo.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text || ':' || p_quiz_id, 0)); -- evita resposta dupla em paralelo

  select l.trilha_id, l.ordem, l.id, q.numero_questoes into v_trilha, v_ordem, v_licao, v_total
  from public.quizzes q join public.licoes l on l.id = q.licao_id where q.id = p_quiz_id;
  if v_trilha is null then raise exception 'Quiz não encontrado'; end if;
  if not exists (select 1 from public.progresso where usuario_id = v_uid and licao_id = v_licao and leitura_concluida_em is not null) then
    raise exception 'Leia a lição antes do quiz';
  end if;
  select count(*) into v_respondidas from public.respostas_quiz where usuario_id = v_uid and quiz_id = p_quiz_id;
  if v_respondidas >= v_total then raise exception 'Este quiz já foi concluído'; end if;

  select * into v_q from public.questoes where id = p_questao_id;
  if not found or not v_q.ativa then raise exception 'Questão indisponível'; end if;
  select l.ordem, l.trilha_id into v_q_ordem, v_q_trilha from public.quizzes qz join public.licoes l on l.id = qz.licao_id where qz.id = v_q.quiz_id;
  if v_q_trilha <> v_trilha or v_q_ordem > v_ordem then raise exception 'Questão fora deste quiz'; end if;
  if p_alternativa < 0 or p_alternativa > 3 then raise exception 'Alternativa inválida'; end if;

  select coalesce((
    select r.nivel_trilha_apos from public.respostas_quiz r
    where r.usuario_id = v_uid and r.trilha_id = v_trilha
    order by r.respondida_em desc, r.id desc limit 1
  ), 'medio') into v_nivel_antes;
  v_acertou := p_alternativa = v_q.resposta_correta;
  v_xp := case
    when not v_acertou then 2
    when v_q.nivel_dificuldade = 'facil' then 10
    when v_q.nivel_dificuldade = 'medio' then 20
    else 35
  end;

  -- Janela deslizante: as N−1 respostas anteriores na trilha mais esta.
  select count(*) filter (where t.acertou), count(*) into v_acertos_janela, v_total_janela
  from (
    select r.acertou from public.respostas_quiz r
    where r.usuario_id = v_uid and r.trilha_id = v_trilha
    order by r.respondida_em desc, r.id desc
    limit greatest(v_janela - 1, 0)
  ) t;
  v_acertos_janela := v_acertos_janela + case when v_acertou then 1 else 0 end;
  v_total_janela := v_total_janela + 1;
  v_nivel_depois := v_nivel_antes;
  if v_total_janela >= v_janela then
    v_taxa := v_acertos_janela * 100.0 / v_janela;
    if v_taxa >= v_subida then
      v_nivel_depois := case v_nivel_antes when 'facil' then 'medio' else 'dificil' end;
    elsif v_taxa <= v_descida then
      v_nivel_depois := case v_nivel_antes when 'dificil' then 'medio' else 'facil' end;
    end if;
  end if;

  insert into public.respostas_quiz (usuario_id, quiz_id, questao_id, trilha_id, nivel_questao, alternativa_marcada, acertou, xp_ganho, nivel_trilha_apos)
  values (v_uid, p_quiz_id, p_questao_id, v_trilha, v_q.nivel_dificuldade, p_alternativa, v_acertou, v_xp, v_nivel_depois);
  update public.usuarios set xp_total = xp_total + v_xp where id = v_uid;

  if v_respondidas + 1 >= v_total then
    v_quiz_concluido := true;
    select count(*) filter (where acertou), coalesce(sum(xp_ganho), 0) into v_acertos_quiz, v_xp_quiz
    from public.respostas_quiz where usuario_id = v_uid and quiz_id = p_quiz_id;
    update public.progresso set quiz_concluido_em = now(), acertos = v_acertos_quiz, xp_ganho = v_xp_quiz
    where usuario_id = v_uid and licao_id = v_licao;
    perform privado.registrar_atividade(v_uid);
    v_trilha_concluida := (
      select count(*) from public.progresso where usuario_id = v_uid and trilha_id = v_trilha and quiz_concluido_em is not null
    ) >= 3;
    v_novas := privado.conceder_conquistas(v_uid, v_acertos_quiz = v_total);
  end if;

  return jsonb_build_object(
    'acertou', v_acertou, 'respostaCorreta', v_q.resposta_correta, 'explicacao', v_q.explicacao,
    'xpGanho', v_xp, 'nivelAntes', v_nivel_antes, 'nivelDepois', v_nivel_depois,
    'quizConcluido', v_quiz_concluido, 'acertosNoQuiz', v_acertos_quiz, 'xpNoQuiz', v_xp_quiz,
    'trilhaConcluida', v_trilha_concluida, 'conquistasNovas', to_jsonb(v_novas));
end;
$$;

-- RF05: resumo dos testes do jovem, pelo pseudônimo calculado no servidor (nunca devolve acertos por pergunta).
create or replace function public.meus_testes()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'tipoTeste', t.tipo_teste, 'forma', t.forma, 'versao', t.versao, 'iniciadoEm', t.iniciado_em,
    'concluidoEm', t.concluido_em, 'pontuacaoTotal', t.pontuacao_total,
    'respondidas', (select count(*) from public.respostas_teste r where r.teste_id = t.id)
  ) order by t.tipo_teste), '[]'::jsonb)
  from public.testes_diagnosticos t
  where (select auth.uid()) is not null
    and t.pseudonimo = privado.pseudonimo_de((select auth.uid()));
$$;

-- RF05: abre (ou retoma) o teste e devolve as perguntas sem a correta.
create or replace function public.iniciar_teste(p_tipo public.tipo_teste)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_pseudonimo text;
  v_forma public.forma_teste := case when p_tipo = 'pre' then 'A' else 'B' end;
  v_teste public.testes_diagnosticos%rowtype;
  v_trilhas_concluidas integer;
begin
  if v_uid is null then raise exception 'Sua sessão expirou. Entre de novo.'; end if;
  if exists (select 1 from public.usuarios where id = v_uid and papel = 'admin') then
    raise exception 'O administrador não faz os testes';
  end if;
  v_pseudonimo := privado.pseudonimo_de(v_uid);
  if v_pseudonimo is null then raise exception 'Segredo do pseudônimo não configurado'; end if;
  if p_tipo = 'pos' then
    if not privado.pre_teste_concluido(v_uid) then raise exception 'Faça o teste inicial primeiro'; end if;
    select count(*) into v_trilhas_concluidas from (
      select trilha_id from public.progresso
      where usuario_id = v_uid and quiz_concluido_em is not null
      group by trilha_id having count(*) >= 3
    ) t;
    if v_trilhas_concluidas < (select count(*) from public.trilhas) then
      raise exception 'Conclua as 4 trilhas para liberar o teste final';
    end if;
  end if;

  insert into public.testes_diagnosticos (pseudonimo, tipo_teste, forma, versao)
  values (v_pseudonimo, p_tipo, v_forma, '1.0')
  on conflict (pseudonimo, tipo_teste) do nothing;
  select * into v_teste from public.testes_diagnosticos where pseudonimo = v_pseudonimo and tipo_teste = p_tipo;

  return jsonb_build_object(
    'resumo', jsonb_build_object(
      'tipoTeste', v_teste.tipo_teste, 'forma', v_teste.forma, 'versao', v_teste.versao, 'iniciadoEm', v_teste.iniciado_em,
      'concluidoEm', v_teste.concluido_em, 'pontuacaoTotal', v_teste.pontuacao_total,
      'respondidas', (select count(*) from public.respostas_teste r where r.teste_id = v_teste.id)),
    'perguntas', (
      select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'numero', p.numero, 'enunciado', p.enunciado, 'alternativas', to_jsonb(p.alternativas)) order by p.numero), '[]'::jsonb)
      from public.perguntas_diagnosticas p where p.forma = v_teste.forma and p.versao = v_teste.versao),
    'respondidas', (
      select coalesce(jsonb_agg(r.pergunta_id), '[]'::jsonb) from public.respostas_teste r where r.teste_id = v_teste.id));
end;
$$;

-- RF05: grava a resposta de uma pergunta (forma, versão e data ficam no teste e na resposta) e fecha o teste na última.
create or replace function public.registrar_resposta_teste(p_tipo public.tipo_teste, p_pergunta_id text, p_alternativa smallint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_teste public.testes_diagnosticos%rowtype;
  v_pergunta public.perguntas_diagnosticas%rowtype;
  v_respondidas integer;
  v_nota integer;
begin
  if v_uid is null then raise exception 'Sua sessão expirou. Entre de novo.'; end if;
  select * into v_teste from public.testes_diagnosticos
  where pseudonimo = privado.pseudonimo_de(v_uid) and tipo_teste = p_tipo
  for update;
  if not found then raise exception 'Teste não iniciado'; end if;
  if v_teste.concluido_em is not null then raise exception 'Teste já concluído'; end if;
  select * into v_pergunta from public.perguntas_diagnosticas
  where id = p_pergunta_id and forma = v_teste.forma and versao = v_teste.versao;
  if not found then raise exception 'Pergunta não pertence a este teste'; end if;
  if p_alternativa < 0 or p_alternativa >= cardinality(v_pergunta.alternativas) then raise exception 'Alternativa inválida'; end if;

  insert into public.respostas_teste (teste_id, pergunta_id, alternativa_marcada, acertou)
  values (v_teste.id, v_pergunta.id, p_alternativa, p_alternativa = v_pergunta.alternativa_correta)
  on conflict (teste_id, pergunta_id) do nothing;

  select count(*), count(*) filter (where acertou) into v_respondidas, v_nota from public.respostas_teste where teste_id = v_teste.id;
  if v_respondidas >= (select count(*) from public.perguntas_diagnosticas where forma = v_teste.forma and versao = v_teste.versao) then
    update public.testes_diagnosticos set concluido_em = now(), pontuacao_total = v_nota where id = v_teste.id;
    return jsonb_build_object('concluido', true);
  end if;
  return jsonb_build_object('concluido', false);
end;
$$;

revoke all on all functions in schema privado from public, anon, authenticated;
revoke all on function public.concluir_leitura(text) from public, anon;
revoke all on function public.proxima_questao(text) from public, anon;
revoke all on function public.responder_questao(text, text, smallint) from public, anon;
revoke all on function public.meus_testes() from public, anon;
revoke all on function public.iniciar_teste(public.tipo_teste) from public, anon;
revoke all on function public.registrar_resposta_teste(public.tipo_teste, text, smallint) from public, anon;
grant execute on function public.concluir_leitura(text) to authenticated;
grant execute on function public.proxima_questao(text) to authenticated;
grant execute on function public.responder_questao(text, text, smallint) to authenticated;
grant execute on function public.meus_testes() to authenticated;
grant execute on function public.iniciar_teste(public.tipo_teste) to authenticated;
grant execute on function public.registrar_resposta_teste(public.tipo_teste, text, smallint) to authenticated;
