-- Funções auxiliares (schema privado, fora da Data API), segredo do pseudônimo e trigger de criação do usuário.

create or replace function privado.is_admin()
returns boolean
language sql
stable
security definer -- de propósito: evita recursão de RLS
set search_path = ''
as $$
  select exists (select 1 from public.usuarios where id = (select auth.uid()) and papel = 'admin');
$$;

create or replace function privado.parametro(p_chave text)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select valor from public.parametros_sistema where chave = p_chave order by alterado_em desc, id desc limit 1;
$$;

-- Segredo do HMAC do pseudônimo: gerado dentro do banco, uma vez só; nunca aparece no git.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'pseudonimo_segredo') then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'pseudonimo_segredo', 'Segredo do HMAC que gera o pseudônimo da pesquisa');
  end if;
end $$;

-- RNF06: pseudônimo = "P-" + 8 caracteres de um HMAC-SHA-256 do id (PRD 8.6).
create or replace function privado.pseudonimo_de(p_usuario uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select 'P-' || upper(left(encode(extensions.hmac(p_usuario::text, s.decrypted_secret, 'sha256'), 'hex'), 8))
  from vault.decrypted_secrets s
  where s.name = 'pseudonimo_segredo';
$$;

create or replace function privado.pre_teste_concluido(p_usuario uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.testes_diagnosticos t
    where t.pseudonimo = privado.pseudonimo_de(p_usuario) and t.tipo_teste = 'pre' and t.concluido_em is not null
  );
$$;

-- RN04: dia de uso no fuso de São Paulo; mesmo dia não muda, dia seguinte soma, depois de uma falha volta a 1.
create or replace function privado.registrar_atividade(p_usuario uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  update public.usuarios u
  set dias_streak = case
        when u.ultimo_dia_uso = v_hoje then u.dias_streak
        when u.ultimo_dia_uso = v_hoje - 1 then u.dias_streak + 1
        else 1
      end,
      ultimo_dia_uso = v_hoje,
      ultima_atividade_em = now()
  where u.id = p_usuario;
end;
$$;

-- Mesma regra de src/lib/texto.ts (minúsculas, sem acento, sem pontuação).
create or replace function privado.normalizar_texto(p_texto text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(regexp_replace(regexp_replace(
    translate(lower(coalesce(p_texto, '')), 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn'),
    '[^a-z0-9 ]', ' ', 'g'), '\s+', ' ', 'g'));
$$;

-- Mesma regra de nomeDeExibicao (src/regras/gamificacao.ts): primeiro nome e inicial do último sobrenome.
create or replace function privado.nome_de_exibicao(p_nome text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_partes text[] := regexp_split_to_array(trim(p_nome), '\s+');
begin
  if cardinality(v_partes) = 1 then
    return v_partes[1];
  end if;
  return v_partes[1] || ' ' || upper(left(v_partes[cardinality(v_partes)], 1)) || '.';
end;
$$;

revoke all on all functions in schema privado from public, anon, authenticated;

-- RF01 e RNF06: cria a linha em usuarios a partir de auth.users, exigindo os três aceites;
-- data e hora dos aceites são as do servidor.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  if coalesce((v_meta ->> 'aceite_tcle')::boolean, false) is not true
     or coalesce((v_meta ->> 'aceite_privacidade')::boolean, false) is not true
     or coalesce((v_meta ->> 'maioridade')::boolean, false) is not true
     or coalesce(v_meta ->> 'tcle_versao', '') = ''
     or char_length(trim(coalesce(v_meta ->> 'nome', ''))) < 2 then
    raise exception 'Cadastro sem os aceites obrigatórios';
  end if;
  insert into public.usuarios (id, nome, papel, tcle_versao, tcle_aceito_em, privacidade_aceita_em, maioridade_declarada_em)
  values (new.id, trim(v_meta ->> 'nome'), 'jovem'::public.papel_usuario, v_meta ->> 'tcle_versao', now(), now(), now());
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin; -- o Auth do Supabase dispara o trigger

-- Sem "drop trigger": a criação só acontece se o gatilho ainda não existir (pode rodar de novo sem erro).
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created' and tgrelid = 'auth.users'::regclass) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end $$;
