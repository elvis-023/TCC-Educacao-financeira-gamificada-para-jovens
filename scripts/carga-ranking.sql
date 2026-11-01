-- RF07/HU07: teste de carga da RPC public.ranking com usuários sintéticos.
-- Rodar no SQL Editor do projeto de DESENVOLVIMENTO. Tudo é desfeito no final (RAISE EXCEPTION): nada fica no banco.
-- Mede o tempo de execução no banco (60 repetições por período e por tamanho); não inclui rede nem autenticação do app.
-- O resultado vem na mensagem de erro "RESULTADO_CARGA ...", com p50, p95 e máximo em milissegundos.
do $$
declare
  uid uuid := gen_random_uuid();
  tempos_geral numeric[]; tempos_semana numeric[];
  t0 timestamptz; i int; n_atual int := 0; saida jsonb := '[]'::jsonb; tam int;
  reais int;
begin
  set local session_replication_role = replica;  -- só nesta transação: pula as chaves estrangeiras da carga sintética
  select count(*) into reais from public.usuarios where papel = 'jovem';
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  foreach tam in array array[1000, 10000] loop
    insert into public.usuarios (id, nome, papel, xp_total, tcle_versao, tcle_aceito_em, privacidade_aceita_em, maioridade_declarada_em)
    select gen_random_uuid(), 'Usuario Teste ' || g, 'jovem', (random() * 5000)::int, 'teste', now(), now(), now()
    from generate_series(n_atual + 1, tam) g;
    -- 20 respostas de quiz e 5 de treino por usuário, nos últimos 10 dias
    insert into public.respostas_quiz (usuario_id, quiz_id, questao_id, trilha_id, nivel_questao, alternativa_marcada, acertou, xp_ganho, nivel_trilha_apos, respondida_em)
    select u.id, 'orcamento-pessoal-1-quiz', 'sintetica-' || k, 'orcamento-pessoal', 'medio', 0, true, 20, 'medio', now() - (random() * interval '10 days')
    from public.usuarios u cross join generate_series(1, 20) k
    where u.nome like 'Usuario Teste %' and not exists (select 1 from public.respostas_quiz r where r.usuario_id = u.id);
    insert into public.respostas_treino (usuario_id, questao_id, acertou, xp_ganho, respondida_em)
    select u.id, 'sintetica-t', true, 4, now() - (random() * interval '10 days')
    from public.usuarios u cross join generate_series(1, 5) k
    where u.nome like 'Usuario Teste %' and not exists (select 1 from public.respostas_treino r where r.usuario_id = u.id);
    n_atual := tam;
    analyze public.usuarios; analyze public.respostas_quiz; analyze public.respostas_treino;
    tempos_geral := '{}'; tempos_semana := '{}';
    for i in 1..60 loop
      t0 := clock_timestamp(); perform count(*) from public.ranking('geral');
      tempos_geral := tempos_geral || (extract(epoch from clock_timestamp() - t0) * 1000)::numeric;
      t0 := clock_timestamp(); perform count(*) from public.ranking('semana');
      tempos_semana := tempos_semana || (extract(epoch from clock_timestamp() - t0) * 1000)::numeric;
    end loop;
    saida := saida || jsonb_build_object(
      'usuarios_sinteticos', tam, 'jovens_no_banco', (select count(*) from public.usuarios where papel = 'jovem'),
      'respostas_quiz', (select count(*) from public.respostas_quiz), 'respostas_treino', (select count(*) from public.respostas_treino),
      'geral_ms', (select jsonb_build_object('p50', round((percentile_cont(0.5) within group (order by t))::numeric, 2), 'p95', round((percentile_cont(0.95) within group (order by t))::numeric, 2), 'max', round(max(t), 2)) from unnest(tempos_geral) t),
      'semana_ms', (select jsonb_build_object('p50', round((percentile_cont(0.5) within group (order by t))::numeric, 2), 'p95', round((percentile_cont(0.95) within group (order by t))::numeric, 2), 'max', round(max(t), 2)) from unnest(tempos_semana) t));
  end loop;
  raise exception 'RESULTADO_CARGA % | jovens reais antes: %', saida, reais;
end $$;
