-- RF09 e RN04: lembrete dentro do app quando a inatividade passa do limite, com trilha iniciada e não concluída,
-- uma vez por período de inatividade. O app chama ao abrir; push real fica para depois.
create or replace function public.gerar_lembrete()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_usuario public.usuarios%rowtype;
  v_limite numeric := coalesce(privado.parametro('limite_inatividade_horas'), 48);
  v_trilha record;
  v_notificacao public.notificacoes%rowtype;
begin
  if v_uid is null then raise exception 'Sua sessão expirou. Entre de novo.'; end if;
  select * into v_usuario from public.usuarios where id = v_uid;
  if not v_usuario.receber_lembretes or v_usuario.ultima_atividade_em is null then return null; end if;
  if now() - v_usuario.ultima_atividade_em <= make_interval(hours => v_limite::integer) then return null; end if;
  if exists (
    select 1 from public.notificacoes
    where usuario_id = v_uid and tipo = 'lembrete' and data_envio >= v_usuario.ultima_atividade_em
  ) then
    return null;
  end if;

  select t.titulo, t.slug, count(*) filter (where p.quiz_concluido_em is not null) as concluidas into v_trilha
  from public.progresso p join public.trilhas t on t.id = p.trilha_id
  where p.usuario_id = v_uid
  group by t.id, t.titulo, t.slug
  having count(*) filter (where p.quiz_concluido_em is not null) < 3
  order by max(greatest(p.leitura_concluida_em, p.quiz_concluido_em)) desc nulls last
  limit 1;
  if not found then return null; end if;

  insert into public.notificacoes (usuario_id, tipo, mensagem, link)
  values (v_uid, 'lembrete',
          'Sua trilha ' || v_trilha.titulo || ' está esperando por você. Que tal continuar a Lição ' || (v_trilha.concluidas + 1) || '?',
          '/trilhas/' || v_trilha.slug)
  returning * into v_notificacao;

  return jsonb_build_object('id', v_notificacao.id::text, 'usuarioId', v_notificacao.usuario_id, 'tipo', v_notificacao.tipo,
    'mensagem', v_notificacao.mensagem, 'link', v_notificacao.link, 'dataEnvio', v_notificacao.data_envio, 'lida', v_notificacao.lida);
end;
$$;

revoke all on function public.gerar_lembrete() from public, anon;
grant execute on function public.gerar_lembrete() to authenticated;
