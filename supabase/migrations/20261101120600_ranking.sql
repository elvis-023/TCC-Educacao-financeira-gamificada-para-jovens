-- RF07 e RNF04: ranking só com nome de exibição e XP (geral ou da semana, de segunda a domingo em São Paulo).
-- A função monta o ranking no servidor e devolve só posição, nome de exibição, XP e se a linha é de quem pediu;
-- nenhum id, e-mail ou outro dado sai daqui.
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
