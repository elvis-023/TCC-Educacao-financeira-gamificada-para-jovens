-- RF11: o administrador altera os parâmetros; cada mudança vira uma linha com autor e data.
create or replace function public.admin_salvar_parametros(p_inatividade numeric, p_janela numeric, p_subida numeric, p_descida numeric)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not privado.is_admin() then raise exception 'Área restrita ao administrador'; end if;
  if p_inatividade is null or p_inatividade <> trunc(p_inatividade) or p_inatividade not between 1 and 720 then raise exception 'Limite de inatividade: inteiro de 1 a 720 horas'; end if;
  if p_janela is null or p_janela <> trunc(p_janela) or p_janela not between 3 and 20 then raise exception 'Janela do motor: inteiro de 3 a 20 respostas'; end if;
  if p_subida is null or p_subida not between 1 and 100 then raise exception 'Limiar de subida: de 1 a 100'; end if;
  if p_descida is null or p_descida not between 0 and 99 then raise exception 'Limiar de descida: de 0 a 99'; end if;
  if p_descida >= p_subida then raise exception 'O limiar de descida precisa ser menor que o de subida'; end if;
  insert into public.parametros_sistema (chave, valor, alterado_por)
  select x.chave, x.valor, (select auth.uid())
  from (values ('limite_inatividade_horas', p_inatividade), ('janela_motor', p_janela), ('limiar_subida', p_subida), ('limiar_descida', p_descida)) as x(chave, valor)
  where x.valor is distinct from privado.parametro(x.chave);
end;
$$;

create or replace function public.admin_historico_parametros()
returns table (chave text, valor numeric, valor_anterior numeric, autor text, alterado_em timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not privado.is_admin() then raise exception 'Área restrita ao administrador'; end if;
  return query
  select p.chave, p.valor,
         lag(p.valor) over (partition by p.chave order by p.alterado_em, p.id),
         coalesce(u.nome, 'Sistema (valor padrão)'),
         p.alterado_em
  from public.parametros_sistema p left join public.usuarios u on u.id = p.alterado_por
  order by p.alterado_em desc, p.id desc;
end;
$$;

revoke all on function public.admin_salvar_parametros(numeric, numeric, numeric, numeric) from public, anon;
revoke all on function public.admin_historico_parametros() from public, anon;
grant execute on function public.admin_salvar_parametros(numeric, numeric, numeric, numeric) to authenticated;
grant execute on function public.admin_historico_parametros() to authenticated;
