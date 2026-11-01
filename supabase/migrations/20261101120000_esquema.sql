-- Etapa 2 — esquema (PRD, apêndice 8.2).
-- Cria os tipos, as 15 tabelas e os índices, e liga a RLS em todas.
-- As permissões de acesso vêm no arquivo 20261101120200_permissoes.sql.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists privado;
revoke all on schema privado from public;

do $$ begin create type public.papel_usuario as enum ('jovem', 'admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.nivel_dificuldade as enum ('facil', 'medio', 'dificil'); exception when duplicate_object then null; end $$;
do $$ begin create type public.tipo_teste as enum ('pre', 'pos'); exception when duplicate_object then null; end $$;
do $$ begin create type public.forma_teste as enum ('A', 'B'); exception when duplicate_object then null; end $$;
do $$ begin create type public.tipo_simulacao as enum ('juros_compostos', 'cartao_credito'); exception when duplicate_object then null; end $$;
do $$ begin create type public.tipo_notificacao as enum ('lembrete', 'conquista', 'sistema'); exception when duplicate_object then null; end $$;

create table if not exists public.usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 80),
  papel public.papel_usuario not null default 'jovem',
  xp_total integer not null default 0 check (xp_total >= 0),
  dias_streak integer not null default 0 check (dias_streak >= 0),
  ultimo_dia_uso date,
  ultima_atividade_em timestamptz,
  receber_lembretes boolean not null default true,
  tcle_versao text not null,
  tcle_aceito_em timestamptz not null,
  privacidade_aceita_em timestamptz not null,
  maioridade_declarada_em timestamptz not null,
  criado_em timestamptz not null default now()
);

create table if not exists public.trilhas (
  id text primary key,
  slug text not null unique,
  titulo text not null,
  descricao text not null,
  categoria text not null,
  ordem smallint not null unique
);

create table if not exists public.licoes (
  id text primary key,
  trilha_id text not null references public.trilhas (id),
  ordem smallint not null check (ordem between 1 and 3),
  titulo text not null,
  conteudo jsonb not null default '[]'::jsonb,
  tempo_leitura_min smallint not null check (tempo_leitura_min between 1 and 30),
  unique (trilha_id, ordem)
);

create table if not exists public.quizzes (
  id text primary key,
  licao_id text not null unique references public.licoes (id),
  tipo_avaliacao text not null default 'adaptativo',
  numero_questoes smallint not null default 3 check (numero_questoes > 0)
);

create table if not exists public.questoes (
  id text primary key default ('q-' || gen_random_uuid()::text),
  quiz_id text not null references public.quizzes (id),
  enunciado text not null check (char_length(enunciado) between 10 and 300),
  alternativas text[] not null check (cardinality(alternativas) = 4),
  resposta_correta smallint not null check (resposta_correta between 0 and 3),
  nivel_dificuldade public.nivel_dificuldade not null,
  explicacao text not null check (char_length(explicacao) between 10 and 400),
  ativa boolean not null default true,
  criado_por uuid references public.usuarios (id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists questoes_quiz_id_idx on public.questoes (quiz_id);
create index if not exists questoes_criado_por_idx on public.questoes (criado_por);

create table if not exists public.respostas_quiz (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  quiz_id text not null references public.quizzes (id),
  questao_id text not null references public.questoes (id),
  trilha_id text not null references public.trilhas (id),
  nivel_questao public.nivel_dificuldade not null,
  alternativa_marcada smallint not null check (alternativa_marcada between 0 and 3),
  acertou boolean not null,
  xp_ganho smallint not null check (xp_ganho >= 0),
  nivel_trilha_apos public.nivel_dificuldade not null,
  respondida_em timestamptz not null default now(),
  unique (usuario_id, quiz_id, questao_id)
);
create index if not exists respostas_quiz_janela_idx on public.respostas_quiz (usuario_id, trilha_id, respondida_em desc);
create index if not exists respostas_quiz_quiz_idx on public.respostas_quiz (quiz_id);
create index if not exists respostas_quiz_questao_idx on public.respostas_quiz (questao_id);
create index if not exists respostas_quiz_trilha_idx on public.respostas_quiz (trilha_id);

create table if not exists public.progresso (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  trilha_id text not null references public.trilhas (id),
  licao_id text not null references public.licoes (id),
  leitura_concluida_em timestamptz,
  quiz_concluido_em timestamptz,
  acertos smallint not null default 0,
  xp_ganho smallint not null default 0,
  sincronizado_offline boolean not null default true,
  unique (usuario_id, licao_id)
);
create index if not exists progresso_trilha_idx on public.progresso (trilha_id);
create index if not exists progresso_licao_idx on public.progresso (licao_id);

create table if not exists public.simulacoes (
  id bigint generated always as identity primary key,
  usuario_id uuid not null default auth.uid() references public.usuarios (id) on delete cascade,
  tipo_simulacao public.tipo_simulacao not null,
  parametros jsonb not null,
  resultado_final numeric(14, 2) not null,
  criada_em timestamptz not null default now()
);
create index if not exists simulacoes_usuario_idx on public.simulacoes (usuario_id, criada_em desc);

create table if not exists public.badges (
  id text primary key,
  nome text not null,
  descricao text not null,
  criterio_marco text not null,
  icone text not null,
  ordem smallint not null unique
);

create table if not exists public.usuario_badges (
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  badge_id text not null references public.badges (id),
  conquistado_em timestamptz not null default now(),
  primary key (usuario_id, badge_id)
);
create index if not exists usuario_badges_badge_idx on public.usuario_badges (badge_id);

create table if not exists public.notificacoes (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  tipo public.tipo_notificacao not null,
  mensagem text not null,
  link text,
  data_envio timestamptz not null default now(),
  lida boolean not null default false
);
create index if not exists notificacoes_usuario_idx on public.notificacoes (usuario_id, data_envio desc);

create table if not exists public.perguntas_diagnosticas (
  id text primary key,
  forma public.forma_teste not null,
  versao text not null,
  numero smallint not null check (numero between 1 and 3),
  enunciado text not null,
  alternativas text[] not null,
  alternativa_correta smallint not null,
  unique (forma, versao, numero)
);

-- Ligado ao participante só pelo pseudônimo, sem chave estrangeira para usuarios (RNF06).
create table if not exists public.testes_diagnosticos (
  id bigint generated always as identity primary key,
  pseudonimo text not null,
  tipo_teste public.tipo_teste not null,
  forma public.forma_teste not null,
  versao text not null,
  iniciado_em timestamptz not null default now(),
  concluido_em timestamptz,
  pontuacao_total smallint check (pontuacao_total between 0 and 3),
  unique (pseudonimo, tipo_teste),
  check ((tipo_teste = 'pre' and forma = 'A') or (tipo_teste = 'pos' and forma = 'B'))
);

create table if not exists public.respostas_teste (
  id bigint generated always as identity primary key,
  teste_id bigint not null references public.testes_diagnosticos (id) on delete cascade,
  pergunta_id text not null references public.perguntas_diagnosticas (id),
  alternativa_marcada smallint not null check (alternativa_marcada >= 0),
  acertou boolean not null,
  respondida_em timestamptz not null default now(),
  unique (teste_id, pergunta_id)
);
create index if not exists respostas_teste_pergunta_idx on public.respostas_teste (pergunta_id);

-- Histórico: cada alteração é uma linha nova, com autor e data (RF11).
create table if not exists public.parametros_sistema (
  id bigint generated always as identity primary key,
  chave text not null check (chave in ('limite_inatividade_horas', 'janela_motor', 'limiar_subida', 'limiar_descida')),
  valor numeric not null,
  alterado_por uuid references public.usuarios (id) on delete set null,
  alterado_em timestamptz not null default now()
);
create index if not exists parametros_sistema_chave_idx on public.parametros_sistema (chave, alterado_em desc);
create index if not exists parametros_sistema_alterado_por_idx on public.parametros_sistema (alterado_por);

alter table public.usuarios enable row level security;
alter table public.trilhas enable row level security;
alter table public.licoes enable row level security;
alter table public.quizzes enable row level security;
alter table public.questoes enable row level security;
alter table public.respostas_quiz enable row level security;
alter table public.progresso enable row level security;
alter table public.simulacoes enable row level security;
alter table public.badges enable row level security;
alter table public.usuario_badges enable row level security;
alter table public.notificacoes enable row level security;
alter table public.perguntas_diagnosticas enable row level security;
alter table public.testes_diagnosticos enable row level security;
alter table public.respostas_teste enable row level security;
alter table public.parametros_sistema enable row level security;
