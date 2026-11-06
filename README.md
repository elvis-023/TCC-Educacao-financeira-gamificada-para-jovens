# Educação Financeira Gamificada

TCC de Engenharia de Software da Universidade São Judas Tadeu — **Grupo 19** (orientador: Prof. Nelson Aguiar).

**Aplicativo publicado:** https://educacao-financeira-gamificada.tcc-grupo19.workers.dev/

Aplicativo web **mobile-first** de educação financeira para jovens adultos (18 anos ou mais):

- **Trilhas** curtas de conteúdo, com quiz ao fim de cada lição.
- **Quiz com dificuldade adaptativa**: avalia as últimas 5 respostas na trilha; 4 ou 5 acertos sobem um nível, 0 a 2 descem, 3 mantêm (parâmetros editáveis pelo administrador).
- **Simuladores** de juros compostos (com o CDI do Banco Central como taxa sugerida) e de fatura de cartão de crédito (rotativo de um mês e parcelamento pela tabela Price, com o teto legal de 100%).
- **Gamificação**: XP, conquistas, ranking e sequência de dias. **Modo Treino** para revisar lições já concluídas.
- **Teste diagnóstico** pré (Forma A) e pós (Forma B), para medir o ganho observado de conhecimento.
- **Administrador**: banco de questões, parâmetros do motor, métricas do estudo, análise estatística e exportação em CSV pseudonimizado.

## Stack

TypeScript, Vite, React, Tailwind CSS, shadcn/ui, React Router, TanStack Query, React Hook Form + Zod, Recharts, GSAP. Backend no Supabase (PostgreSQL, Auth, RLS e RPC). Publicação em um Worker da Cloudflare com assets estáticos.

## Como rodar

Requer Node.js 22 ou mais recente.

```bash
npm install
cp .env.example .env     # preencha conforme o modo abaixo
npm run dev              # http://localhost:5173
```

Dois modos de dados, escolhidos por `VITE_FONTE_DADOS` no `.env`:

| Modo | Para quê | O que precisa |
|---|---|---|
| `local` (padrão) | Ver o app sem servidor, com dados **fictícios** guardados no navegador (marcados como demonstração na tela). | Nada além do `npm install`. |
| `supabase` | Funcionamento real: contas, banco e RLS. | `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (chave pública) do seu projeto, com o banco criado conforme [docs/base-de-dados.md](docs/base-de-dados.md). |

Nunca coloque a chave `service_role` no front nem no repositório.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarga automática. |
| `npm run build` | Confere os tipos (`tsc -b`) e gera `dist/`. |
| `npm run preview` | Serve o `dist/` localmente. |
| `npm run test` | Vitest: regras de negócio em `src/regras/` e os repositórios. |
| `npm run lint` | Oxlint. |
| `npm run deploy` | Build e publicação na Cloudflare (`wrangler deploy`). Ver [docs/publicacao.md](docs/publicacao.md). |
| `npm run gerar:seed` | Gera os SQL de conteúdo em `supabase/migrations/` a partir de `src/dados/demo`. |
| `npm run auditar:banco` | Audita o banco de questões: contagens, duplicatas e viés de tamanho das alternativas. |
| `npm run conferir:calculos` | Compara os simuladores com casos calculados de forma independente (RNF01). |

## Estrutura

```text
src/
  regras/          regras de negócio em funções puras, cobertas por testes
                   (motorAdaptativo, simuladores, gamificacao, sequencia, treino, pesquisa, estatistica)
  dados/           repositórios (local e Supabase) e dados de demonstração
  pages/           telas do jovem e do administrador
  components/      componentes de interface (components/ui é do shadcn)
  lib/             formatação, fuso America/Sao_Paulo, animações, cliente Supabase
supabase/migrations/   esquema, RLS, RPC e conteúdo do banco, em ordem
scripts/               geração de seed, auditoria, conferência de cálculos e teste de carga
docs/                  base de dados, publicação, medições, plano e PRD
```

## Regras que não são óbvias

- **Juros compostos**: `M = C × (1 + i)^t + A × ((1 + i)^t − 1) / i`, aporte no fim de cada mês. Taxa anual vira mensal por equivalência, `i = (1 + a)^(1/12) − 1`, nunca `a / 12`. Aceite fixo: C = 1.000, A = 100, i = 1% ao mês, t = 12 → R$ 2.395,08.
- **Dia de uso** é o dia-calendário em `America/Sao_Paulo`, nunca em UTC.
- **XP**: acerto Fácil 10, Médio 20, Difícil 35; erro 2. No Modo Treino, 20% desses valores, com teto de 40 XP por dia.
- As respostas do estudo ficam ligadas só a um **identificador pseudonimizado**, separado do nome e do e-mail. Nunca se coletam dados bancários.

## Pesquisa e privacidade

O estudo pré e pós-uso só será feito com participantes reais depois da aprovação ética. O projeto Supabase usado hoje é de desenvolvimento e demonstração: **não contém dado de participante**. Dados de demonstração nunca são resultado do estudo.

## Documentação

- [docs/base-de-dados.md](docs/base-de-dados.md): como recriar o banco, tabelas, RPC e segurança.
- [docs/medicoes.md](docs/medicoes.md): números medidos (testes, desempenho, acessibilidade, carga do ranking e conferência dos cálculos).
- [docs/publicacao.md](docs/publicacao.md): publicação na Cloudflare.
- [docs/prd.md](docs/prd.md): telas e fluxos.

Os simuladores têm caráter educativo e não constituem recomendação de investimento.
