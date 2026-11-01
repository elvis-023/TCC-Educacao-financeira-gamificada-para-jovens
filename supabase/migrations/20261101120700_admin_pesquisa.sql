-- RF12 e RNF06: métricas e exportação da pesquisa, só para o administrador e só com o pseudônimo.
-- Nome e e-mail não entram em nenhuma das duas funções.

create or replace function public.metricas_pesquisa()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_resultado jsonb;
begin
  if not privado.is_admin() then raise exception 'Área restrita ao administrador'; end if;
  with testes as (
    select t.id, t.pseudonimo, t.tipo_teste, t.concluido_em, t.pontuacao_total
    from public.testes_diagnosticos t where t.concluido_em is not null
  ), pares as (
    select pre.pseudonimo, pre.pontuacao_total as nota_pre, pos.pontuacao_total as nota_pos, pre.id as id_pre, pos.id as id_pos
    from testes pre join testes pos on pos.pseudonimo = pre.pseudonimo and pos.tipo_teste = 'pos'
    where pre.tipo_teste = 'pre'
  )
  select jsonb_build_object(
    'participantes', (select count(*) from public.usuarios where papel = 'jovem'),
    'preConcluidos', (select count(*) from testes where tipo_teste = 'pre'),
    'posConcluidos', (select count(*) from testes where tipo_teste = 'pos'),
    'nPares', (select count(*) from pares),
    'ganhoMedio', (select avg((nota_pos - nota_pre) * 100.0 / 3) from pares), -- 3 perguntas por forma (versão 1.0)
    'porPergunta', (
      select coalesce(jsonb_agg(jsonb_build_object('numero', x.numero, 'pre', x.pre, 'pos', x.pos) order by x.numero), '[]'::jsonb)
      from (
        select pd.numero,
               coalesce(avg(case when t.tipo_teste = 'pre' then r.acertou::int end) * 100, 0) as pre,
               coalesce(avg(case when t.tipo_teste = 'pos' then r.acertou::int end) * 100, 0) as pos
        from public.respostas_teste r
        join testes t on t.id = r.teste_id
        join public.perguntas_diagnosticas pd on pd.id = r.pergunta_id
        where r.teste_id in (select id_pre from pares union select id_pos from pares)
        group by pd.numero
      ) x),
    'participantesTabela', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'pseudonimo', p.pseudonimo, 'preData', pre.concluido_em, 'preNota', pre.pontuacao_total,
        'posData', pos.concluido_em, 'posNota', pos.pontuacao_total) order by p.pseudonimo), '[]'::jsonb)
      from (select distinct pseudonimo from testes) p
      left join testes pre on pre.pseudonimo = p.pseudonimo and pre.tipo_teste = 'pre'
      left join testes pos on pos.pseudonimo = p.pseudonimo and pos.tipo_teste = 'pos')
  ) into v_resultado;
  return v_resultado;
end;
$$;

create or replace function public.exportar_respostas_testes()
returns table (id_pseudonimizado text, tipo_teste text, forma text, versao text, data date, pergunta smallint, resposta_marcada text, acerto integer, nota_total smallint)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not privado.is_admin() then raise exception 'Área restrita ao administrador'; end if;
  return query
  select t.pseudonimo, t.tipo_teste::text, t.forma::text, t.versao,
         (r.respondida_em at time zone 'America/Sao_Paulo')::date,
         pd.numero, pd.alternativas[r.alternativa_marcada + 1], r.acertou::int, t.pontuacao_total
  from public.respostas_teste r
  join public.testes_diagnosticos t on t.id = r.teste_id
  join public.perguntas_diagnosticas pd on pd.id = r.pergunta_id
  where t.concluido_em is not null
  order by t.pseudonimo, t.tipo_teste, pd.numero;
end;
$$;

revoke all on function public.metricas_pesquisa() from public, anon;
revoke all on function public.exportar_respostas_testes() from public, anon;
grant execute on function public.metricas_pesquisa() to authenticated;
grant execute on function public.exportar_respostas_testes() to authenticated;
