# Plano de implementação — Educação Financeira Gamificada

Plano para construir o app descrito em `docs/prd.md` (versão 1.1), um passo de cada vez. Cada passo diz o que ler antes, os arquivos, as tarefas (com os testes), como conferir e o que o usuário testa ao fim.

- Objetivo: entregar o app web mobile-first do TCC funcionando com dados fictícios (etapa 1) e, logo depois do essencial e do pré-teste, com base de dados real no Supabase (etapa 2).
- Arquitetura: SPA em Vite + React + TypeScript. As regras de negócio ficam em funções puras em `src/regras/`, testadas com Vitest. As telas só leem e gravam dados por repositórios (`src/dados/repositorios/`), que têm duas implementações: `local` (localStorage, com os dados de demonstração e as ferramentas de demonstração) e `supabase` (Supabase Auth, PostgreSQL com RLS e funções no servidor). A variável `VITE_FONTE_DADOS` escolhe a implementação.
- Stack: Vite, React, TypeScript, Tailwind CSS 4, shadcn/ui, lucide-react, sonner, React Router 7, TanStack Query 5, React Hook Form 7 + Zod 4, Recharts 3, date-fns 4 + `@date-fns/tz`, Vitest, supabase-js 2, Worker da Cloudflare (wrangler).
- Fonte da verdade: `docs/prd.md`. Os textos das telas (botões, mensagens, avisos) são copiados de lá, palavra por palavra.

---

## 0. Como executar este plano

- Um passo de cada vez, na ordem da seção 1. Ao terminar um passo: rodar `npm run test`, `npm run lint` e `npm run build`, mostrar o resultado ao usuário com a lista "O que o usuário testa" do passo e esperar o teste dele antes de seguir (regra "uma mudança por vez" das instruções do projeto).
- Toda resposta que fecha um passo termina com "O que você faz agora", como pedem as instruções do projeto.
- Commit só quando o usuário pedir. Cada passo sugere uma mensagem. O commit sai com a identidade git da máquina e sem linhas de coautoria (regra do repositório).
- Antes de cada passo, ler as seções do PRD indicadas em "Ler antes".
- Regra de negócio sempre com TDD: escrever o teste, rodar e ver falhar, implementar, rodar e ver passar. O nome do teste cita o requisito (ex.: `RN01: ...`).
- Não editar `src/components/ui/*` (gerado pelo shadcn) nem `src/lib/supabase/types.ts` (gerado do banco). Compor por cima.
- SQL: os arquivos ficam em `supabase/migrations/`, e o usuário roda cada um no SQL Editor do Supabase, na ordem dos nomes. Cada tarefa de SQL traz uma consulta de conferência e uma explicação curta do que o arquivo faz, para o usuário.
- Se uma regra do PRD parecer errada, parar e avisar o usuário em vez de mudar a regra. O motor adaptativo, os simuladores e a pesquisa são conferidos pelo orientador.
- Comandos: funcionam no Git Bash e no PowerShell, exceto onde o passo diz "no Git Bash".

---

## 1. Ordem dos passos e onde entra a etapa 2

| Bloco | Passos | Prioridade | Resultado ao fim do bloco |
|---|---|---|---|
| A | 1 a 11 | Essencial | App com todo o essencial, em dados fictícios |
| A | 12 (pré-teste) | Importante | Medição inicial da pesquisa funcionando |
| B | E2.1 a E2.7 | Etapa 2, núcleo | Contas reais, pré-teste, trilhas, quiz, XP, sequência, conquistas e simuladores gravando no Supabase |
| C | 13 a 19 | Importante | Pós-teste, conquistas, ranking, perfil e área do administrador, nos dois modos |
| D | 20 e 21 | Desejável | Lembretes, notificações e parâmetros, nos dois modos |
| E | 22 | Todas | Revisão final e publicação |

Por que a etapa 2 entra depois do passo 12, e não depois do 11:

- A regra de acesso 3 do PRD (4.4; decisão 1 da 7.5) manda todo jovem fazer o pré-teste antes de usar o app. No modo Supabase todas as contas são novas, então, sem o pré-teste, nenhuma conta real passaria da primeira tela.
- As respostas do teste por pergunta, ligadas ao pseudônimo, são a parte da base que o orientador mais cobra (RF05, RNF06 e o feedback de 08/10).
- Com os blocos A e B prontos, a entrega de 02/11 tem base de dados funcionando no fluxo principal (cadastro com aceites, pré-teste, trilhas, quiz adaptativo, XP, sequência e simuladores), mesmo que faltem o Importante restante e o Desejável.

Se o tempo apertar:

- Os SQL de E2.2 e E2.3 não dependem das telas e podem rodar a qualquer momento depois do passo 2; o de E2.4 precisa do conteúdo dos passos 7 e 9; o de E2.5 não depende de nada além deles. Rodar esses SQL cedo garante a base criada, mesmo que a conexão do app (E2.6 e E2.7) fique para depois.
- Nos passos 13 a 21, a "Parte local" vem antes da "Parte Supabase". Sem tempo, a parte Supabase pode ficar para depois: a função continua no modo local, e os métodos novos do repositório Supabase usam `naoDisponivel` (criado no E2.6), para o projeto continuar compilando.

O que cada modo faz:

- Modo local (`VITE_FONTE_DADOS=local`, o padrão): tudo o que o PRD descreve, com os dados de demonstração, os atalhos de login e as ferramentas de demonstração. É o modo da apresentação.
- Modo Supabase (`VITE_FONTE_DADOS=supabase`): contas reais e dados no PostgreSQL. Os atalhos de login e as ferramentas de demonstração não aparecem (PRD 8.8). O ranking e a visão geral do administrador mostram só as contas de teste criadas no projeto de desenvolvimento, com o selo "Contas de teste (projeto de desenvolvimento)" no lugar de "Dados de demonstração (fictícios)". O modo offline se limita ao banner e a mensagens de erro amigáveis, porque a sincronização offline real está fora do escopo (PRD 7.1).

---

## 2. Mapa de arquivos

```
.npmrc                          save-exact=true (versões fixas no package.json)
.env.example                    VITE_FONTE_DADOS, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (sem valores)
wrangler.jsonc                  Worker só com os arquivos estáticos e fallback de SPA
scripts/gerar-seed.ts           gera o SQL do conteúdo a partir de src/dados/demo (E2.4)
supabase/migrations/*.sql       SQL da etapa 2, rodado no SQL Editor, na ordem dos nomes
src/
  main.tsx                      provedores e roteador
  index.css                     Tailwind, tokens de cor (PRD 5.2) e fonte
  app/rotas.tsx                 todas as rotas do PRD 4.3
  app/guardas.tsx               regras de acesso do PRD 4.4
  app/consultas.ts              QueryClient
  layouts/                      LayoutPublico, LayoutJovem, LayoutFoco, LayoutAdmin
  pages/publico/                BoasVindas, Cadastro, Entrar, EsqueciSenha, RedefinirSenha (E2.6)
  pages/jovem/                  PreTeste, PosTeste, Inicio, Trilhas, Trilha, Licao, Quiz, ResultadoQuiz,
                                Simuladores, JurosCompostos, FaturaCartao, Ranking, Conquistas,
                                Notificacoes, Perfil
  pages/admin/                  VisaoGeral, BancoQuestoes, Parametros, ExportarDados
  pages/TelaProvisoria.tsx      tela provisória usada até cada tela existir
  pages/NaoEncontrada.tsx       T24
  components/                   componentes do app (TopoJovem, BarraInferior, BannerOffline, ModalTermo,
                                ModalConquista, FerramentasDemonstracao, CampoMoeda, CampoPercentual,
                                EtiquetaNivel, Celebracao, AvisoEducativo, SeloDados, ...)
  components/ui/                shadcn (não editar)
  regras/                       simuladores, motorAdaptativo, gamificacao, sequencia, progresso, pesquisa
                                (+ arquivos .test.ts ao lado)
  dados/tipos.ts                tipos que espelham as classes (PRD 6.1)
  dados/demo/                   dados de demonstração e conteúdo (trilhas, lições, questões, testes)
  dados/bancoLocal.ts           coleções que mudam, no localStorage
  dados/aparelho.ts             estado do aparelho: sessão local, trilhas baixadas, relógio simulado
  dados/repositorios/           contratos.ts, index.ts, local/, supabase/
  hooks/                        useSessao, useConexao, useRelogio, dados/ (consultas do TanStack Query)
  lib/                          fuso, formatacao, texto, csv, relogio, tema, utils (shadcn), supabase/
```

---

## 3. Convenções técnicas

IDs do conteúdo, estáveis e iguais nos dois modos:

- Trilha: o slug (`orcamento-pessoal`, `juros-compostos`, `cartao-de-credito`, `inflacao-e-investimentos`).
- Lição: `<trilha>-<ordem>` (ex.: `juros-compostos-2`). A rota usa o slug da trilha e a ordem: `/trilhas/juros-compostos/licoes/2`.
- Quiz: `<lição>-quiz` (ex.: `juros-compostos-2-quiz`).
- Questão: `<lição>-<nível><n>`, com nível `f`, `m` ou `d`. Lição 1: `f1, m1, m2, m3`; lição 2: `f1, m1, m2, d1`; lição 3: `f1, m1, d1, d2` (PRD 6.6). Ex.: `juros-compostos-2-d1`. Questões criadas pelo administrador recebem um id aleatório.
- Conquista: o código (`primeiro_quiz`, `primeira_trilha`, `sequencia_7_dias`, `gabaritou`, `desafio_aceito`, `mestre_das_financas`).
- Pergunta diagnóstica: `<forma>-<número>` (ex.: `A-1`), com a versão (`1.0`) num campo próprio.
- Usuários de demonstração: `demo-alex`, `demo-admin`, `demo-bruna` e assim por diante. Outros registros do modo local: `crypto.randomUUID()`.

Datas, dinheiro e percentuais:

- Instantes guardados como texto ISO em UTC (`new Date(...).toISOString()`). Dia de uso como `AAAA-MM-DD` no fuso de São Paulo.
- As regras nunca chamam `new Date()` sem argumento: recebem `agora` como parâmetro. O app usa `agora()` de `src/lib/relogio.ts`, que soma o relógio simulado.
- Dinheiro e taxas como `number`, com precisão total. Arredondar só na exibição. Nos testes, comparar em centavos: `Math.round(valor * 100)`.
- Taxas, limiares e acertos em percentual de 0 a 100 (não em fração), exceto a taxa mensal `i` dentro das fórmulas.
- Erros de regra: `throw new Error('mensagem em português')`, com o texto que a tela mostra.

---

## 4. Contratos dos repositórios (versão final)

Cada passo cria a parte de que precisa. Esta é a forma final de `src/dados/repositorios/contratos.ts`, para os nomes baterem do começo ao fim:

```ts
import type {
  Badge, ChaveParametro, CodigoBadge, LinhaExportacao, LinhaHistoricoParametro, LinhaRanking, Licao,
  MetricasPesquisa, Notificacao, Papel, PerguntaPublica, Progresso, QuestaoAdmin, QuestaoEditavel,
  QuestaoPublica, Quiz, RespostaQuiz, ResultadoResposta, ResumoTeste, Sessao, Simulacao, TipoTeste,
  Trilha, Usuario, UsuarioBadge,
} from '@/dados/tipos';

export interface DadosCadastro { nome: string; email: string; senha: string; tcleVersao: string }

export interface RepositorioSessao {
  sessaoAtual(): Promise<Sessao | null>;
  observar(aoMudar: () => void): () => void;
  cadastrar(dados: DadosCadastro): Promise<void>;
  entrar(email: string, senha: string): Promise<void>;
  entrarDemonstracao(papel: Papel): Promise<void>; // só no modo local
  sair(): Promise<void>;
  pedirNovaSenha(email: string): Promise<void>;
  definirNovaSenha(senha: string): Promise<void>; // só no modo Supabase
}
export interface RepositorioUsuario {
  meuUsuario(): Promise<Usuario>;
  definirReceberLembretes(valor: boolean): Promise<void>;
}
export interface RepositorioConteudo {
  listarTrilhas(): Promise<Trilha[]>;
  listarLicoes(): Promise<Licao[]>;
  listarQuizzes(): Promise<Quiz[]>;
  listarBadges(): Promise<Badge[]>;
}
export interface RepositorioProgresso {
  meusProgressos(): Promise<Progresso[]>;
  minhasRespostas(): Promise<RespostaQuiz[]>;
  concluirLeitura(licaoId: string): Promise<void>;
  sincronizarPendentes(): Promise<number>;
}
export interface RepositorioQuiz {
  proximaQuestao(quizId: string): Promise<QuestaoPublica | null>;
  responder(quizId: string, questaoId: string, alternativa: number): Promise<ResultadoResposta>;
}
export interface RepositorioTestes {
  meusTestes(): Promise<ResumoTeste[]>;
  iniciar(tipo: TipoTeste): Promise<{ resumo: ResumoTeste; perguntas: PerguntaPublica[]; respondidas: string[] }>;
  responder(tipo: TipoTeste, perguntaId: string, alternativa: number): Promise<{ concluido: boolean }>;
}
export interface RepositorioSimulacoes {
  minhasSimulacoes(): Promise<Simulacao[]>;
  salvar(simulacao: Pick<Simulacao, 'tipoSimulacao' | 'parametros' | 'resultadoFinal'>): Promise<void>;
}
export interface RepositorioConquistas { minhasConquistas(): Promise<UsuarioBadge[]> }
export interface RepositorioRanking { ranking(periodo: 'geral' | 'semana'): Promise<LinhaRanking[]> }
export interface RepositorioNotificacoes {
  minhasNotificacoes(): Promise<Notificacao[]>;
  marcarComoLida(id: string): Promise<void>;
  marcarTodasComoLidas(): Promise<void>;
  verificarLembrete(): Promise<Notificacao | null>;
}
export interface RepositorioAdmin {
  metricasPesquisa(): Promise<MetricasPesquisa>;
  exportarRespostas(): Promise<LinhaExportacao[]>;
  listarQuestoes(): Promise<QuestaoAdmin[]>;
  salvarQuestao(questao: QuestaoEditavel): Promise<string>;
  parametrosAtuais(): Promise<Record<ChaveParametro, number>>;
  historicoParametros(): Promise<LinhaHistoricoParametro[]>;
  salvarParametros(valores: Record<ChaveParametro, number>): Promise<void>;
}
export interface RepositorioDemonstracao {
  disponivel: boolean;
  limiteDeInatividade(): Promise<number>;
  avancarRelogio(horas: number): Promise<void>;
  liberarPosTeste(): Promise<void>;
  reiniciar(): Promise<void>;
}
export interface Repositorios {
  sessao: RepositorioSessao; usuario: RepositorioUsuario; conteudo: RepositorioConteudo;
  progresso: RepositorioProgresso; quiz: RepositorioQuiz; testes: RepositorioTestes;
  simulacoes: RepositorioSimulacoes; conquistas: RepositorioConquistas; ranking: RepositorioRanking;
  notificacoes: RepositorioNotificacoes; admin: RepositorioAdmin; demonstracao: RepositorioDemonstracao;
}
export type { CodigoBadge };
```

Regra de leitura: as telas usam os repositórios por hooks do TanStack Query em `src/hooks/dados/`, com as chaves centralizadas em `src/hooks/dados/chaves.ts`. Depois de uma gravação, invalidar as chaves afetadas (ex.: depois de responder, `usuario`, `progresso`, `respostas`, `ranking`, `conquistas`, `notificacoes`).

---

## Passo 1 — Base do projeto (Essencial)

Ler antes: PRD 4.2, 4.3, 5.1 a 5.4; instruções do projeto (Stack e comandos; Ambientes e deploy).

Arquivos:
- Criar: `.npmrc`, `package.json` e arquivos do Vite (a partir do modelo), `vite.config.ts`, `src/index.css`, `src/main.tsx`, `src/app/consultas.ts`, `src/app/rotas.tsx`, `src/layouts/LayoutPublico.tsx`, `src/layouts/LayoutJovem.tsx`, `src/layouts/LayoutFoco.tsx`, `src/layouts/LayoutAdmin.tsx`, `src/pages/TelaProvisoria.tsx`, `src/pages/NaoEncontrada.tsx`, `src/lib/tema.ts`, `wrangler.jsonc`, `.env.example`.
- Gerados pelo shadcn: `components.json`, `src/lib/utils.ts`, `src/components/ui/*`.
- Não mexer: `.gitignore`, o arquivo de instruções do projeto e `docs/`.

Tarefas:

- [ ] 1.1 Criar `.npmrc`, para o `npm install` gravar versões exatas:

```
save-exact=true
```

- [ ] 1.2 Gerar o modelo do Vite numa pasta temporária e trazer só o necessário (no Git Bash). O `.gitignore` do modelo não é copiado: o do repositório já cobre `node_modules`, `dist` e `.env`.

```bash
npm create vite@latest tmp-vite -- --template react-ts
cp tmp-vite/package.json tmp-vite/index.html tmp-vite/vite.config.ts tmp-vite/eslint.config.js tmp-vite/tsconfig.json tmp-vite/tsconfig.app.json tmp-vite/tsconfig.node.json .
cp -r tmp-vite/src .
rm -rf tmp-vite src/assets src/App.css src/App.tsx
```

Se o assistente do Vite perguntar se deve instalar e iniciar, responder que não. Depois:
- em `package.json`, trocar `"name"` para `"educacao-financeira-gamificada"`;
- em `index.html`: `<html lang="pt-BR">`, `<title>Educação Financeira Gamificada</title>` e remover a linha do ícone `vite.svg` (o PRD pede nenhuma logo).

- [ ] 1.3 Instalar as dependências, com as versões maiores que este plano usa:

```bash
npm install
npm install react-router@7 @tanstack/react-query@5 react-hook-form@7 @hookform/resolvers@5 zod@4 recharts@3 date-fns@4 @date-fns/tz@1 lucide-react sonner@2 @fontsource-variable/inter
npm install -D tailwindcss@4 @tailwindcss/vite@4 vitest @types/node tsx wrangler
```

- [ ] 1.4 Substituir `vite.config.ts`:

```ts
/// <reference types="vitest/config" />
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: { environment: 'node', include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'] },
});
```

Se o modelo usar `@vitejs/plugin-react-swc`, manter o import que veio no modelo.

- [ ] 1.5 Alias `@/` no TypeScript: acrescentar em `compilerOptions` de `tsconfig.json` e de `tsconfig.app.json`:

```json
"paths": { "@/*": ["./src/*"] }
```

- [ ] 1.6 Scripts em `package.json` (manter `dev`, `build`, `lint` e `preview` do modelo):

```json
"test": "vitest run --passWithNoTests",
"test:watch": "vitest",
"deploy": "npm run build && wrangler deploy",
"gerar:seed": "tsx scripts/gerar-seed.ts"
```

- [ ] 1.7 Tailwind e shadcn/ui. Trocar todo o conteúdo de `src/index.css` por `@import "tailwindcss";` e rodar:

```bash
npx shadcn@latest init
```

Escolher a cor base "Neutral". O comando grava `components.json`, `src/lib/utils.ts` e as variáveis de tema em `src/index.css`. Depois, instalar os componentes do PRD 5.4:

```bash
npx shadcn@latest add button card badge progress tabs toggle-group radio-group checkbox switch input label textarea select slider dialog alert-dialog sheet table skeleton tooltip separator scroll-area sonner form
```

Se o componente `form` não existir na versão instalada do shadcn, instalar `field` no lugar e usar o mesmo padrão com React Hook Form.

- [ ] 1.8 Tokens de cor do PRD 5.2. No `src/index.css` gerado, trocar `--primary`, `--primary-foreground` e `--ring` dentro de `:root` e de `.dark` e acrescentar os tokens do app (valores da paleta do Tailwind 4, conferidos para 4,5:1 sobre fundo branco no tema claro):

```css
:root {
  --primary: oklch(0.508 0.118 165.612);            /* emerald-700 */
  --primary-foreground: oklch(0.985 0 0);
  --ring: oklch(0.508 0.118 165.612);
  --acerto: oklch(0.527 0.154 150.069);             /* green-700 */
  --acerto-fundo: oklch(0.982 0.018 155.826);       /* green-50 */
  --erro: oklch(0.505 0.213 27.518);                /* red-700 */
  --erro-fundo: oklch(0.971 0.013 17.38);           /* red-50 */
  --xp: oklch(0.555 0.163 48.998);                  /* amber-700: texto */
  --xp-icone: oklch(0.769 0.188 70.08);             /* amber-500: só ícone com texto ao lado */
  --sequencia: oklch(0.553 0.195 38.402);           /* orange-700: texto */
  --sequencia-icone: oklch(0.705 0.213 47.604);     /* orange-500: só ícone */
}
.dark {
  --primary: oklch(0.765 0.177 163.223);            /* emerald-400 */
  --primary-foreground: oklch(0.262 0.051 172.552); /* emerald-950 */
  --ring: oklch(0.765 0.177 163.223);
  --acerto: oklch(0.792 0.209 151.711);             /* green-400 */
  --acerto-fundo: oklch(0.266 0.065 152.934);       /* green-950 */
  --erro: oklch(0.704 0.191 22.216);                /* red-400 */
  --erro-fundo: oklch(0.258 0.092 26.042);          /* red-950 */
  --xp: oklch(0.828 0.189 84.429);                  /* amber-400 */
  --xp-icone: oklch(0.828 0.189 84.429);
  --sequencia: oklch(0.75 0.183 55.934);            /* orange-400 */
  --sequencia-icone: oklch(0.75 0.183 55.934);
}
@theme inline {
  --font-sans: 'Inter Variable', ui-sans-serif, system-ui, sans-serif;
  --color-acerto: var(--acerto);
  --color-acerto-fundo: var(--acerto-fundo);
  --color-erro: var(--erro);
  --color-erro-fundo: var(--erro-fundo);
  --color-xp: var(--xp);
  --color-xp-icone: var(--xp-icone);
  --color-sequencia: var(--sequencia);
  --color-sequencia-icone: var(--sequencia-icone);
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

Com isso existem as classes `text-acerto`, `bg-acerto-fundo`, `text-erro`, `text-xp`, `text-sequencia` e assim por diante. Valores em reais, XP e percentuais usam a classe `tabular-nums`.

- [ ] 1.9 Tema claro e escuro, salvo no aparelho (`src/lib/tema.ts`):

```ts
export type Tema = 'claro' | 'escuro';
const CHAVE = 'efg:tema';

export function lerTema(): Tema {
  try {
    return localStorage.getItem(CHAVE) === 'escuro' ? 'escuro' : 'claro';
  } catch {
    return 'claro';
  }
}

export function aplicarTema(tema: Tema): void {
  document.documentElement.classList.toggle('dark', tema === 'escuro');
}

export function definirTema(tema: Tema): void {
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {
    // sem armazenamento: vale só até recarregar
  }
  aplicarTema(tema);
}
```

- [ ] 1.10 `src/app/consultas.ts`:

```ts
import { QueryClient } from '@tanstack/react-query';

export const clienteConsultas = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});
```

- [ ] 1.11 `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router/dom';
import '@fontsource-variable/inter';
import './index.css';
import { clienteConsultas } from '@/app/consultas';
import { roteador } from '@/app/rotas';
import { Toaster } from '@/components/ui/sonner';
import { aplicarTema, lerTema } from '@/lib/tema';

aplicarTema(lerTema());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={clienteConsultas}>
      <RouterProvider router={roteador} />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  </StrictMode>,
);
```

O `Toaster` gerado pelo shadcn pode depender de um provedor de tema (`next-themes`). Se depender, trocar no `src/components/ui/sonner.tsx` não é permitido: criar `src/components/Notificador.tsx` que renderiza o `Toaster` do pacote `sonner` com `theme={lerTema() === 'escuro' ? 'dark' : 'light'}` e usar esse no `main.tsx`.

- [ ] 1.12 Tela provisória e página não encontrada:

```tsx
// src/pages/TelaProvisoria.tsx
export function TelaProvisoria({ titulo }: { titulo: string }) {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">{titulo}</h1>
      <p className="text-muted-foreground">Tela provisória.</p>
    </section>
  );
}
```

```tsx
// src/pages/NaoEncontrada.tsx (T24)
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function NaoEncontrada() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <Button asChild><Link to="/">Voltar</Link></Button>
    </main>
  );
}
```

O destino do botão passa a depender do papel no passo 6.

- [ ] 1.13 Layouts (PRD 5.1). Os quatro usam `<Outlet />` do React Router:
  - `LayoutPublico`: coluna central de até 430 px, centralizada, com margem de 16 px.
  - `LayoutFoco`: igual, sem barra inferior (pré-teste, pós-teste, lição, quiz e resultado).
  - `LayoutJovem`: fundo `bg-muted/40`; coluna `max-w-[430px]` com `bg-background`; `<main id="conteudo" className="flex-1 px-4 pb-24 pt-4">`; barra inferior fixa com 5 itens (`NavLink` para `/inicio`, `/trilhas`, `/simuladores`, `/ranking`, `/perfil`, com os ícones `House`, `BookOpen`, `Calculator`, `Trophy` e `User` de `lucide-react`, cada um com rótulo visível e altura mínima de 56 px; o item ativo usa `text-primary`; o `NavLink` já marca `aria-current="page"`). O topo fixo entra no passo 10.
  - `LayoutAdmin`: menu lateral fixo de 240 px com `NavLink` para Visão geral (`/admin`, com `end`), Banco de questões, Parâmetros e Exportar dados; no rodapé do menu, os botões Ferramentas de demonstração, Voltar ao app e Sair (sem ação até os passos 6 e 16). Abaixo de 1024 px (`lg:`), o menu some e um botão no topo abre o mesmo menu num `Sheet`. Conteúdo com até 1200 px.

- [ ] 1.14 Rotas do PRD 4.3 com telas provisórias (`src/app/rotas.tsx`):

```tsx
import { createBrowserRouter } from 'react-router';
import { LayoutAdmin } from '@/layouts/LayoutAdmin';
import { LayoutFoco } from '@/layouts/LayoutFoco';
import { LayoutJovem } from '@/layouts/LayoutJovem';
import { LayoutPublico } from '@/layouts/LayoutPublico';
import { NaoEncontrada } from '@/pages/NaoEncontrada';
import { TelaProvisoria } from '@/pages/TelaProvisoria';

const provisoria = (titulo: string) => <TelaProvisoria titulo={titulo} />;

export const roteador = createBrowserRouter([
  {
    element: <LayoutPublico />,
    children: [
      { path: '/', element: provisoria('T01 Boas-vindas') },
      { path: '/cadastro', element: provisoria('T02 Cadastro') },
      { path: '/entrar', element: provisoria('T03 Login') },
      { path: '/esqueci-senha', element: provisoria('T04 Esqueci minha senha') },
    ],
  },
  {
    element: <LayoutFoco />,
    children: [
      { path: '/pre-teste', element: provisoria('T05 Pré-teste') },
      { path: '/pos-teste', element: provisoria('T06 Pós-teste') },
      { path: '/trilhas/:trilha/licoes/:licao', element: provisoria('T10 Lição') },
      { path: '/trilhas/:trilha/licoes/:licao/quiz', element: provisoria('T11 Quiz') },
      { path: '/trilhas/:trilha/licoes/:licao/resultado', element: provisoria('T12 Resultado do quiz') },
    ],
  },
  {
    element: <LayoutJovem />,
    children: [
      { path: '/inicio', element: provisoria('T07 Início') },
      { path: '/trilhas', element: provisoria('T08 Trilhas') },
      { path: '/trilhas/:trilha', element: provisoria('T09 Trilha') },
      { path: '/simuladores', element: provisoria('T13 Simuladores') },
      { path: '/simuladores/juros-compostos', element: provisoria('T14 Juros compostos') },
      { path: '/simuladores/cartao-de-credito', element: provisoria('T15 Fatura do cartão') },
      { path: '/ranking', element: provisoria('T16 Ranking') },
      { path: '/conquistas', element: provisoria('T17 Conquistas') },
      { path: '/notificacoes', element: provisoria('T18 Notificações') },
      { path: '/perfil', element: provisoria('T19 Perfil') },
    ],
  },
  {
    path: '/admin',
    element: <LayoutAdmin />,
    children: [
      { index: true, element: provisoria('T20 Visão geral') },
      { path: 'questoes', element: provisoria('T21 Banco de questões') },
      { path: 'parametros', element: provisoria('T22 Parâmetros') },
      { path: 'exportar', element: provisoria('T23 Exportar dados') },
    ],
  },
  { path: '*', element: <NaoEncontrada /> },
]);
```

Nos passos seguintes, cada tela troca o `provisoria(...)` da sua rota pelo componente real, carregado com `lazy` nas rotas da área do administrador e dos simuladores (PRD 7.2).

- [ ] 1.15 Publicação (Worker com arquivos estáticos e fallback de SPA). `wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "educacao-financeira-gamificada",
  "compatibility_date": "2026-10-01",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

- [ ] 1.16 `.env.example` (versionado, sem valores):

```
# local (padrão, dados de demonstração) ou supabase (etapa 2)
VITE_FONTE_DADOS=local
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Conferir:

```bash
npm run test
npm run lint
npm run build
npm run dev
```

Esperado: os três primeiros sem erro (o `test` diz que não há testes e passa); em `http://localhost:5173`, cada rota da tabela 4.3 mostra a sua tela provisória com o layout certo, e uma rota inexistente mostra "Página não encontrada".

O que o usuário testa:
1. `npm run dev` e abrir `http://localhost:5173/inicio`, `/trilhas/juros-compostos/licoes/2/quiz` e `/admin/questoes`: barra inferior só na área do jovem, menu lateral só no administrador.
2. No DevTools, largura de celular (375 px) e de desktop: a área do jovem fica numa coluna de até 430 px.
3. Opcional: `npx wrangler login` (uma vez) e `npm run deploy` para publicar no Worker.

Commit sugerido: `chore: base do projeto com Vite, Tailwind, shadcn e rotas provisórias`.

---

## Passo 2 — Formatos, relógio, tipos, dados de demonstração e banco local (Essencial)

Ler antes: PRD 5.7, 6.1 a 6.4, 6.7 e 6.8.

Arquivos:
- Criar: `src/lib/fuso.ts`, `src/lib/formatacao.ts`, `src/lib/formatacao.test.ts`, `src/lib/relogio.ts`, `src/dados/aparelho.ts`, `src/dados/tipos.ts`, `src/dados/demo/trilhas.ts`, `src/dados/demo/licoes/index.ts`, `src/dados/demo/badges.ts`, `src/dados/demo/perguntasDiagnosticas.ts`, `src/dados/demo/usuarios.ts`, `src/dados/demo/historico.ts`, `src/dados/demo/pesquisa.ts`, `src/dados/demo/notificacoes.ts`, `src/dados/demo/parametros.ts`, `src/dados/demo/index.ts`, `src/dados/demo/demo.test.ts`, `src/dados/bancoLocal.ts`, `src/dados/repositorios/contratos.ts`, `src/dados/repositorios/local/comum.ts`, `src/dados/repositorios/local/conteudo.ts`, `src/dados/repositorios/local/index.ts`, `src/dados/repositorios/index.ts`, `src/hooks/dados/chaves.ts`, `src/hooks/dados/useConteudo.ts`.

Tarefas:

- [ ] 2.1 Fuso de São Paulo (`src/lib/fuso.ts`). `TZDate.toISOString()` devolve o horário com deslocamento; por isso a conversão para ISO em UTC passa por `new Date(x.getTime())`.

```ts
import { TZDate } from '@date-fns/tz';
import { format, startOfWeek } from 'date-fns';

export const FUSO = 'America/Sao_Paulo';

export function noFuso(instante: Date | string | number): TZDate {
  return new TZDate(new Date(instante).getTime(), FUSO);
}

/** Dia-calendário em São Paulo, no formato AAAA-MM-DD. */
export function diaNoFuso(instante: Date | string | number): string {
  return format(noFuso(instante), 'yyyy-MM-dd');
}

/** Instante ISO (UTC) de um horário de São Paulo, `diasAtras` dias antes de `agora`. */
export function instanteRelativo(agora: Date, diasAtras: number, hora: number, minuto = 0): string {
  const hoje = noFuso(agora);
  const alvo = new TZDate(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - diasAtras, hora, minuto, 0, FUSO);
  return new Date(alvo.getTime()).toISOString();
}

/** Segunda-feira 00h00 da semana corrente, em São Paulo (PRD 2.9). */
export function inicioDaSemana(agora: Date): Date {
  return new Date(startOfWeek(noFuso(agora), { weekStartsOn: 1 }).getTime());
}

/** Diferença em dias entre dois dias AAAA-MM-DD (b − a). */
export function diasEntre(a: string, b: string): number {
  const utc = (dia: string) => {
    const [ano, mes, d] = dia.split('-').map(Number);
    return Date.UTC(ano, mes - 1, d);
  };
  return Math.round((utc(b) - utc(a)) / 86_400_000);
}
```

- [ ] 2.2 Teste dos formatos (`src/lib/formatacao.test.ts`). O `Intl` usa espaço não separável depois de "R$"; o teste normaliza os espaços.

```ts
import { describe, expect, it } from 'vitest';
import { diaNoFuso, diasEntre, inicioDaSemana } from './fuso';
import {
  formatarData, formatarDataHora, formatarHora, formatarMoeda, formatarPercentual,
  formatarPercentualInteiro, formatarPontosPercentuais, formatarXp, paraNumero,
} from './formatacao';

const semEspacoEspecial = (s: string) => s.replace(/\s/g, ' ');

describe('formatos pt-BR (PRD 5.7)', () => {
  it('moeda R$ 1.234,56, arredondando só na exibição', () => {
    expect(semEspacoEspecial(formatarMoeda(1234.56))).toBe('R$ 1.234,56');
    expect(semEspacoEspecial(formatarMoeda(2395.075331451668))).toBe('R$ 2.395,08');
  });
  it('percentuais, XP e pontos percentuais', () => {
    expect(formatarPercentual(10)).toBe('10,00%');
    expect(formatarPercentualInteiro(100 / 3)).toBe('33%');
    expect(formatarXp(1234)).toBe('1.234 XP');
    expect(formatarPontosPercentuais(200 / 3)).toBe('+67 p.p.');
    expect(formatarPontosPercentuais(-100 / 3)).toBe('−33 p.p.');
    expect(formatarPontosPercentuais(0)).toBe('0 p.p.');
    expect(formatarPontosPercentuais(80 / 3, 1)).toBe('+26,7 p.p.');
  });
  it('datas no fuso de São Paulo: 01h30 UTC de 11/03 ainda é 10/03 em Brasília', () => {
    const instante = new Date('2026-03-11T01:30:00Z');
    expect(formatarData(instante)).toBe('10/03/2026');
    expect(formatarHora(instante)).toBe('22:30');
    expect(formatarDataHora(instante)).toBe('10/03/2026 às 22:30');
    expect(diaNoFuso(instante)).toBe('2026-03-10');
  });
  it('semana de segunda a domingo em São Paulo e diferença de dias', () => {
    expect(inicioDaSemana(new Date('2026-11-04T18:00:00Z')).toISOString()).toBe('2026-11-02T03:00:00.000Z');
    expect(diasEntre('2026-10-31', '2026-11-01')).toBe(1);
  });
  it('lê número digitado com vírgula', () => {
    expect(paraNumero('10,5')).toBe(10.5);
    expect(paraNumero('1.234,56')).toBe(1234.56);
    expect(paraNumero('')).toBeNull();
    expect(paraNumero('abc')).toBeNull();
  });
});
```

Rodar `npm run test` e ver falhar (módulo inexistente).

- [ ] 2.3 Implementar `src/lib/formatacao.ts`:

```ts
import { format } from 'date-fns';
import { noFuso } from './fuso';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const moedaCompacta = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });
const duasCasas = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const umaCasa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

export const formatarMoeda = (valor: number) => moeda.format(valor);
export const formatarMoedaCompacta = (valor: number) => moedaCompacta.format(valor);
export const formatarDecimal = (valor: number) => duasCasas.format(valor);
export const formatarPercentual = (percentual: number) => `${duasCasas.format(percentual)}%`;
export const formatarPercentualInteiro = (percentual: number) => `${inteiro.format(percentual)}%`;
export const formatarXp = (xp: number) => `${inteiro.format(xp)} XP`;

export function formatarPontosPercentuais(pp: number, casas: 0 | 1 = 0): string {
  const arredondado = Number(pp.toFixed(casas));
  const fmt = casas === 1 ? umaCasa : inteiro;
  if (arredondado === 0) return `${fmt.format(0)} p.p.`;
  return `${arredondado > 0 ? '+' : '−'}${fmt.format(Math.abs(arredondado))} p.p.`;
}

export const formatarData = (instante: Date | string) => format(noFuso(instante), 'dd/MM/yyyy');
export const formatarHora = (instante: Date | string) => format(noFuso(instante), 'HH:mm');
export const formatarDataHora = (instante: Date | string) => `${formatarData(instante)} às ${formatarHora(instante)}`;

/** Converte texto digitado em pt-BR ("1.234,56") em número; vazio ou inválido vira null. */
export function paraNumero(texto: string): number | null {
  const limpo = texto.trim().replace(/\./g, '').replace(',', '.');
  if (limpo === '') return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}
```

Rodar `npm run test`: deve passar.

- [ ] 2.4 Estado do aparelho (`src/dados/aparelho.ts`), com aviso para quem estiver ouvindo (o relógio simulado redesenha a tela):

```ts
export interface EstadoAparelho {
  sessaoUsuarioId: string | null;
  trilhasBaixadas: string[];
  deslocamentoRelogioMs: number;
  posTesteLiberadoDemo: boolean;
}

const CHAVE = 'efg:aparelho';
const PADRAO: EstadoAparelho = { sessaoUsuarioId: null, trilhasBaixadas: [], deslocamentoRelogioMs: 0, posTesteLiberadoDemo: false };
let estado: EstadoAparelho | null = null;
const ouvintes = new Set<() => void>();

export function lerAparelho(): EstadoAparelho {
  if (estado) return estado;
  try {
    const bruto = localStorage.getItem(CHAVE);
    estado = bruto ? { ...PADRAO, ...JSON.parse(bruto) } : { ...PADRAO };
  } catch {
    estado = { ...PADRAO };
  }
  return estado!;
}

export function atualizarAparelho(parcial: Partial<EstadoAparelho>): void {
  estado = { ...lerAparelho(), ...parcial };
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // sem armazenamento: fica em memória
  }
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function assinarAparelho(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}
```

- [ ] 2.5 Relógio (`src/lib/relogio.ts`):

```ts
import { atualizarAparelho, lerAparelho } from '@/dados/aparelho';

export function agora(): Date {
  return new Date(Date.now() + lerAparelho().deslocamentoRelogioMs);
}

export function avancarRelogio(horas: number): void {
  atualizarAparelho({ deslocamentoRelogioMs: lerAparelho().deslocamentoRelogioMs + horas * 3_600_000 });
}

export function zerarRelogio(): void {
  atualizarAparelho({ deslocamentoRelogioMs: 0 });
}
```

- [ ] 2.6 Tipos (`src/dados/tipos.ts`), espelhando as classes (PRD 6.1). É o contrato de todo o app:

```ts
export type Papel = 'jovem' | 'admin';
export type Nivel = 'facil' | 'medio' | 'dificil';
export type TipoTeste = 'pre' | 'pos';
export type FormaTeste = 'A' | 'B';
export type TipoNotificacao = 'lembrete' | 'conquista' | 'sistema';
export type StatusTrilha = 'nao_iniciada' | 'em_andamento' | 'concluida';
export type CodigoBadge = 'primeiro_quiz' | 'primeira_trilha' | 'sequencia_7_dias' | 'gabaritou' | 'desafio_aceito' | 'mestre_das_financas';
export type ChaveParametro = 'limite_inatividade_horas' | 'janela_motor' | 'limiar_subida' | 'limiar_descida';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  xpTotal: number;
  diasStreak: number;
  ultimoDiaUso: string | null; // AAAA-MM-DD no fuso de São Paulo
  ultimaAtividadeEm: string | null; // ISO da última lição ou quiz concluído
  receberLembretes: boolean;
  tcleVersao: string | null;
  tcleAceitoEm: string | null;
  privacidadeAceitaEm: string | null;
  maioridadeDeclaradaEm: string | null;
  criadoEm: string;
  xpSemanaFicticio?: number; // só nos 11 jovens fictícios do ranking (PRD 6.3)
}
export type Administrador = Usuario & { papel: 'admin' };
export interface Sessao { usuarioId: string; papel: Papel; nome: string }

export interface Trilha { id: string; slug: string; titulo: string; descricao: string; categoria: string; ordem: number }
export type BlocoConteudo =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'exemplo'; titulo: string; linhas: string[] }
  | { tipo: 'resumo'; itens: string[] };
export interface Licao { id: string; trilhaId: string; ordem: 1 | 2 | 3; titulo: string; tempoLeituraMin: number; conteudo: BlocoConteudo[] }
export interface Quiz { id: string; licaoId: string; tipoAvaliacao: 'adaptativo'; numeroQuestoes: number }

export interface Questao {
  id: string;
  quizId: string;
  enunciado: string;
  alternativas: [string, string, string, string];
  respostaCorreta: 0 | 1 | 2 | 3;
  nivelDificuldade: Nivel;
  explicacao: string;
  ativa: boolean;
  criadoEm: string;
  atualizadoEm: string;
}
/** O que o quiz mostra antes da resposta: sem a correta e sem a explicação. */
export interface QuestaoPublica {
  id: string;
  enunciado: string;
  alternativas: string[];
  nivelDificuldade: Nivel;
  licaoOrdem: number;
  numeroNoQuiz: number;
  totalNoQuiz: number;
}
export interface QuestaoAdmin extends Questao { trilhaId: string; licaoId: string; licaoOrdem: number }
export interface QuestaoEditavel {
  id: string | null;
  quizId: string;
  enunciado: string;
  alternativas: [string, string, string, string];
  respostaCorreta: 0 | 1 | 2 | 3;
  nivelDificuldade: Nivel;
  explicacao: string;
  ativa: boolean;
}

export interface RespostaQuiz {
  id: string;
  usuarioId: string;
  quizId: string;
  questaoId: string;
  trilhaId: string;
  nivelQuestao: Nivel;
  alternativaMarcada: number;
  acertou: boolean;
  xpGanho: number;
  nivelTrilhaApos: Nivel;
  respondidaEm: string;
}
export interface ResultadoResposta {
  acertou: boolean;
  respostaCorreta: number;
  explicacao: string;
  xpGanho: number;
  nivelAntes: Nivel;
  nivelDepois: Nivel;
  quizConcluido: boolean;
  acertosNoQuiz: number;
  xpNoQuiz: number;
  trilhaConcluida: boolean;
  conquistasNovas: CodigoBadge[];
}
export interface Progresso {
  id: string;
  usuarioId: string;
  trilhaId: string;
  licaoId: string;
  leituraConcluidaEm: string | null;
  quizConcluidoEm: string | null;
  acertos: number;
  xpGanho: number;
  sincronizadoOffline: boolean;
}
export interface ProgressoTrilha {
  trilhaId: string;
  licoesConcluidas: number;
  status: StatusTrilha;
  nivelAtual: Nivel;
  taxaAcertos: number | null;
  dataUltimoAcesso: string | null;
}

export type UnidadeTaxa = 'mes' | 'ano';
export type UnidadePrazo = 'meses' | 'anos';
export interface EntradaJuros { valorInicial: number; aporteMensal: number; taxaPercentual: number; unidadeTaxa: UnidadeTaxa; prazo: number; unidadePrazo: UnidadePrazo }
export interface EntradaFatura { valorFatura: number; pagamentoMinimo: number; taxaRotativoPercentual: number; taxaParcelamentoPercentual: number; parcelas: number }
export type Simulacao =
  | { id: string; usuarioId: string; tipoSimulacao: 'juros_compostos'; parametros: EntradaJuros; resultadoFinal: number; criadaEm: string }
  | { id: string; usuarioId: string; tipoSimulacao: 'cartao_credito'; parametros: EntradaFatura; resultadoFinal: number; criadaEm: string };

export interface Badge { id: CodigoBadge; nome: string; criterioMarco: string; icone: string; ordem: number }
export interface UsuarioBadge { usuarioId: string; badgeId: CodigoBadge; conquistadoEm: string }
export interface Notificacao { id: string; usuarioId: string; tipo: TipoNotificacao; mensagem: string; link: string | null; dataEnvio: string; lida: boolean }

export interface TesteDiagnostico {
  id: string;
  pseudonimo: string;
  tipoTeste: TipoTeste;
  forma: FormaTeste;
  versao: string;
  iniciadoEm: string;
  concluidoEm: string | null;
  pontuacaoTotal: number | null;
}
export interface PerguntaDiagnostica { id: string; forma: FormaTeste; versao: string; numero: 1 | 2 | 3; enunciado: string; alternativas: string[]; alternativaCorreta: number }
export type PerguntaPublica = Pick<PerguntaDiagnostica, 'id' | 'numero' | 'enunciado' | 'alternativas'>;
export interface RespostaTeste { id: string; testeId: string; perguntaId: string; alternativaMarcada: number; acertou: boolean; respondidaEm: string }
export interface ResumoTeste {
  tipoTeste: TipoTeste;
  forma: FormaTeste;
  versao: string;
  iniciadoEm: string;
  concluidoEm: string | null;
  pontuacaoTotal: number | null;
  respondidas: number;
}

export interface ParametroSistema { id: string; chave: ChaveParametro; valor: number; alteradoPor: string | null; alteradoEm: string }
export interface LinhaHistoricoParametro { chave: ChaveParametro; valorAnterior: number | null; valor: number; autor: string; alteradoEm: string }

export interface LinhaRanking { posicao: number; nomeExibicao: string; xp: number; ehVoce: boolean }

export interface MetricasPesquisa {
  participantes: number;
  preConcluidos: number;
  posConcluidos: number;
  nPares: number;
  ganhoMedio: number | null; // pontos percentuais, só de quem fez os dois testes
  porPergunta: { numero: number; pre: number; pos: number }[]; // % de acerto, só pares
  participantesTabela: { pseudonimo: string; preData: string | null; preNota: number | null; posData: string | null; posNota: number | null }[];
}
export interface LinhaExportacao {
  idPseudonimizado: string;
  tipoTeste: TipoTeste;
  forma: FormaTeste;
  versao: string;
  data: string; // dd/mm/aaaa
  pergunta: number;
  respostaMarcada: string;
  acerto: 0 | 1;
  notaTotal: number;
}
```

- [ ] 2.7 Conteúdo fixo, que fica no código e não no localStorage (assim, mudar o conteúdo não exige reiniciar os dados):

`src/dados/demo/licoes/index.ts` (o passo 7 preenche):

```ts
import type { BlocoConteudo } from '@/dados/tipos';

/** Conteúdo de cada lição, pelo id da lição. Preenchido no passo 7. */
export const CONTEUDO: Record<string, BlocoConteudo[]> = {};
/** Minutos de leitura de cada lição, pelo id da lição. Preenchido no passo 7. */
export const TEMPO_DE_LEITURA: Record<string, number> = {};
```

`src/dados/demo/trilhas.ts`:

```ts
import type { Licao, Quiz, Trilha } from '@/dados/tipos';
import { CONTEUDO, TEMPO_DE_LEITURA } from './licoes';

export const TRILHAS: Trilha[] = [
  { id: 'orcamento-pessoal', slug: 'orcamento-pessoal', titulo: 'Orçamento Pessoal', descricao: 'Organize o seu dinheiro e monte a sua reserva.', categoria: 'Organização', ordem: 1 },
  { id: 'juros-compostos', slug: 'juros-compostos', titulo: 'Juros Compostos', descricao: 'Juros sobre juros: faça o tempo trabalhar por você.', categoria: 'Investimentos', ordem: 2 },
  { id: 'cartao-de-credito', slug: 'cartao-de-credito', titulo: 'Cartão de Crédito', descricao: 'Use o cartão sem cair no rotativo.', categoria: 'Crédito', ordem: 3 },
  { id: 'inflacao-e-investimentos', slug: 'inflacao-e-investimentos', titulo: 'Inflação e Investimentos', descricao: 'Proteja o seu poder de compra e diversifique.', categoria: 'Investimentos', ordem: 4 },
];

const TITULOS: Record<string, [string, string, string]> = {
  'orcamento-pessoal': ['Para onde vai o seu dinheiro', 'Montando o seu orçamento', 'Reserva de emergência'],
  'juros-compostos': ['Juros simples e juros compostos', 'O tempo a seu favor', 'Taxa ao mês e taxa ao ano'],
  'cartao-de-credito': ['Como funciona a fatura', 'Mínimo e rotativo', 'Parcelamento e teto dos juros'],
  'inflacao-e-investimentos': ['O que é inflação', 'Rendimento real', 'Diversificação'],
};

export const LICOES: Licao[] = TRILHAS.flatMap((trilha) =>
  TITULOS[trilha.id].map((titulo, i) => {
    const id = `${trilha.id}-${i + 1}`;
    return { id, trilhaId: trilha.id, ordem: (i + 1) as 1 | 2 | 3, titulo, tempoLeituraMin: TEMPO_DE_LEITURA[id] ?? 4, conteudo: CONTEUDO[id] ?? [] };
  }),
);

export const QUIZZES: Quiz[] = LICOES.map((licao) => ({ id: `${licao.id}-quiz`, licaoId: licao.id, tipoAvaliacao: 'adaptativo', numeroQuestoes: 3 }));
```

`src/dados/demo/badges.ts` (PRD 2.10):

```ts
import type { Badge } from '@/dados/tipos';

export const BADGES: Badge[] = [
  { id: 'primeiro_quiz', nome: 'Primeiro Quiz', criterioMarco: 'Conclua seu primeiro quiz', icone: 'CircleCheck', ordem: 1 },
  { id: 'primeira_trilha', nome: 'Primeira Trilha', criterioMarco: 'Conclua todas as lições de uma trilha', icone: 'Flag', ordem: 2 },
  { id: 'sequencia_7_dias', nome: 'Sequência de 7 dias', criterioMarco: 'Estude 7 dias seguidos', icone: 'Flame', ordem: 3 },
  { id: 'gabaritou', nome: 'Gabaritou', criterioMarco: 'Acerte as 3 questões de um quiz', icone: 'Target', ordem: 4 },
  { id: 'desafio_aceito', nome: 'Desafio Aceito', criterioMarco: 'Chegue ao nível Difícil em uma trilha', icone: 'Mountain', ordem: 5 },
  { id: 'mestre_das_financas', nome: 'Mestre das Finanças', criterioMarco: 'Conclua as 4 trilhas', icone: 'Crown', ordem: 6 },
];
```

`src/dados/demo/perguntasDiagnosticas.ts`: as 6 perguntas do PRD 2.2, copiadas exatamente, com as alternativas na ordem do PRD e `versao: '1.0'`. As corretas: A-1 e B-1 → índice 0 ("Mais de ..."); A-2 e B-2 → índice 2 ("Menos"); A-3 e B-3 → índice 1 ("Falso").

```ts
import type { PerguntaDiagnostica } from '@/dados/tipos';

export const VERSAO_TESTE = '1.0';

export const PERGUNTAS_DIAGNOSTICAS: PerguntaDiagnostica[] = [
  { id: 'A-1', forma: 'A', versao: VERSAO_TESTE, numero: 1, enunciado: 'Suponha que você tenha R$ 100 numa poupança e que a taxa de juros seja de 2% ao ano. Depois de 5 anos, quanto você teria na conta se deixasse o dinheiro render?', alternativas: ['Mais de R$ 102', 'Exatamente R$ 102', 'Menos de R$ 102', 'Não sei'], alternativaCorreta: 0 },
  { id: 'A-2', forma: 'A', versao: VERSAO_TESTE, numero: 2, enunciado: 'Suponha que a taxa de juros da poupança seja de 1% ao ano e a inflação de 2% ao ano. Depois de 1 ano, você conseguiria comprar mais, exatamente o mesmo ou menos do que hoje com o dinheiro dessa conta?', alternativas: ['Mais', 'Exatamente o mesmo', 'Menos', 'Não sei'], alternativaCorreta: 2 },
  { id: 'A-3', forma: 'A', versao: VERSAO_TESTE, numero: 3, enunciado: 'Verdadeiro ou falso: comprar ações de uma única empresa normalmente oferece um retorno mais seguro do que um fundo de ações.', alternativas: ['Verdadeiro', 'Falso', 'Não sei'], alternativaCorreta: 1 },
  { id: 'B-1', forma: 'B', versao: VERSAO_TESTE, numero: 1, enunciado: 'Suponha que você tenha R$ 200 numa poupança e que a taxa de juros seja de 3% ao ano. Depois de 5 anos, quanto você teria na conta se deixasse o dinheiro render?', alternativas: ['Mais de R$ 206', 'Exatamente R$ 206', 'Menos de R$ 206', 'Não sei'], alternativaCorreta: 0 },
  { id: 'B-2', forma: 'B', versao: VERSAO_TESTE, numero: 2, enunciado: 'Suponha que a taxa de juros da poupança seja de 2% ao ano e a inflação de 4% ao ano. Depois de 1 ano, você conseguiria comprar mais, exatamente o mesmo ou menos do que hoje com o dinheiro dessa conta?', alternativas: ['Mais', 'Exatamente o mesmo', 'Menos', 'Não sei'], alternativaCorreta: 2 },
  { id: 'B-3', forma: 'B', versao: VERSAO_TESTE, numero: 3, enunciado: 'Verdadeiro ou falso: investir todo o dinheiro em um único ativo costuma ser mais seguro do que dividi-lo entre vários ativos.', alternativas: ['Verdadeiro', 'Falso', 'Não sei'], alternativaCorreta: 1 },
];
```

- [ ] 2.8 Usuários de demonstração (`src/dados/demo/usuarios.ts`, PRD 6.3). Pseudônimos ficam num mapa à parte (2.10), nunca no usuário.

```ts
import type { Usuario } from '@/dados/tipos';
import { diaNoFuso, instanteRelativo } from '@/lib/fuso';

export const ID_ALEX = 'demo-alex';
export const ID_ADMIN = 'demo-admin';
export const TCLE_VERSAO = 'provisoria-1';

interface JovemFicticio { id: string; nome: string; email: string; xpTotal: number; xpSemana: number; diasAtrasCadastro: number; pseudonimo: string }

export const JOVENS_FICTICIOS: JovemFicticio[] = [
  { id: 'demo-bruna', nome: 'Bruna Moreira', email: 'bruna.moreira@exemplo.test', xpTotal: 940, xpSemana: 85, diasAtrasCadastro: 20, pseudonimo: 'P-1B2D' },
  { id: 'demo-caio', nome: 'Caio Ribeiro', email: 'caio.ribeiro@exemplo.test', xpTotal: 760, xpSemana: 140, diasAtrasCadastro: 19, pseudonimo: 'P-A41C' },
  { id: 'demo-duda', nome: 'Duda Farias', email: 'duda.farias@exemplo.test', xpTotal: 590, xpSemana: 20, diasAtrasCadastro: 18, pseudonimo: 'P-5E7B' },
  { id: 'demo-enzo', nome: 'Enzo Tavares', email: 'enzo.tavares@exemplo.test', xpTotal: 430, xpSemana: 0, diasAtrasCadastro: 17, pseudonimo: 'P-92F0' },
  { id: 'demo-gabi', nome: 'Gabi Lopes', email: 'gabi.lopes@exemplo.test', xpTotal: 265, xpSemana: 45, diasAtrasCadastro: 16, pseudonimo: 'P-C3D8' },
  { id: 'demo-heitor', nome: 'Heitor Santana', email: 'heitor.santana@exemplo.test', xpTotal: 124, xpSemana: 60, diasAtrasCadastro: 12, pseudonimo: 'P-0A6E' },
  { id: 'demo-iara', nome: 'Iara Nogueira', email: 'iara.nogueira@exemplo.test', xpTotal: 105, xpSemana: 35, diasAtrasCadastro: 11, pseudonimo: 'P-E15B' },
  { id: 'demo-joao', nome: 'João Pires', email: 'joao.pires@exemplo.test', xpTotal: 80, xpSemana: 0, diasAtrasCadastro: 10, pseudonimo: 'P-4D9A' },
  { id: 'demo-kaua', nome: 'Kauã Vasconcelos', email: 'kaua.vasconcelos@exemplo.test', xpTotal: 55, xpSemana: 25, diasAtrasCadastro: 9, pseudonimo: 'P-B8C2' },
  { id: 'demo-lara', nome: 'Lara Campos', email: 'lara.campos@exemplo.test', xpTotal: 30, xpSemana: 30, diasAtrasCadastro: 8, pseudonimo: 'P-6F01' },
  { id: 'demo-mateus', nome: 'Mateus Barros', email: 'mateus.barros@exemplo.test', xpTotal: 10, xpSemana: 10, diasAtrasCadastro: 7, pseudonimo: 'P-7F3A' },
];
export const PSEUDONIMO_ALEX = 'P-3C9E';

export function criarUsuarios(agora: Date): Usuario[] {
  const ultimaAtividade = instanteRelativo(agora, 1, 20, 0);
  const cadastroAlex = instanteRelativo(agora, 5, 19, 0);
  const alex: Usuario = {
    id: ID_ALEX, nome: 'Alex Lima', email: 'alex.lima@exemplo.test', papel: 'jovem', xpTotal: 120, diasStreak: 4,
    ultimoDiaUso: diaNoFuso(ultimaAtividade), ultimaAtividadeEm: ultimaAtividade, receberLembretes: true,
    tcleVersao: TCLE_VERSAO, tcleAceitoEm: cadastroAlex, privacidadeAceitaEm: cadastroAlex, maioridadeDeclaradaEm: cadastroAlex, criadoEm: cadastroAlex,
  };
  const admin: Usuario = {
    id: ID_ADMIN, nome: 'Admin Demonstração', email: 'admin@exemplo.test', papel: 'admin', xpTotal: 0, diasStreak: 0,
    ultimoDiaUso: null, ultimaAtividadeEm: null, receberLembretes: false, tcleVersao: null, tcleAceitoEm: null,
    privacidadeAceitaEm: null, maioridadeDeclaradaEm: null, criadoEm: instanteRelativo(agora, 30, 9, 0),
  };
  const outros: Usuario[] = JOVENS_FICTICIOS.map((j) => {
    const cadastro = instanteRelativo(agora, j.diasAtrasCadastro, 18, 0);
    return {
      id: j.id, nome: j.nome, email: j.email, papel: 'jovem', xpTotal: j.xpTotal, diasStreak: 0, ultimoDiaUso: null,
      ultimaAtividadeEm: null, receberLembretes: true, tcleVersao: TCLE_VERSAO, tcleAceitoEm: cadastro,
      privacidadeAceitaEm: cadastro, maioridadeDeclaradaEm: cadastro, criadoEm: cadastro, xpSemanaFicticio: j.xpSemana,
    };
  });
  return [alex, admin, ...outros];
}
```

- [ ] 2.9 Histórico do jovem principal (`src/dados/demo/historico.ts`, PRD 6.4). As questões seguem a convenção de ids da seção 3 deste plano; o passo 9 cria as questões com esses mesmos ids.

```ts
import type { Nivel, Progresso, RespostaQuiz, UsuarioBadge } from '@/dados/tipos';
import { instanteRelativo } from '@/lib/fuso';
import { ID_ALEX } from './usuarios';

type Linha = [questaoId: string, nivelQuestao: Nivel, acertou: boolean, nivelTrilhaApos: Nivel];

const QUIZZES_DO_ALEX: { diasAtras: number; horaLeitura: [number, number]; licaoId: string; respostas: Linha[] }[] = [
  { diasAtras: 4, horaLeitura: [19, 0], licaoId: 'orcamento-pessoal-1', respostas: [
    ['orcamento-pessoal-1-m1', 'medio', true, 'medio'],
    ['orcamento-pessoal-1-m2', 'medio', false, 'medio'],
    ['orcamento-pessoal-1-m3', 'medio', false, 'medio'],
  ] },
  { diasAtras: 3, horaLeitura: [19, 0], licaoId: 'orcamento-pessoal-2', respostas: [
    ['orcamento-pessoal-2-m1', 'medio', true, 'medio'],
    ['orcamento-pessoal-2-m2', 'medio', false, 'facil'],
    ['orcamento-pessoal-2-f1', 'facil', true, 'facil'],
  ] },
  { diasAtras: 2, horaLeitura: [19, 0], licaoId: 'orcamento-pessoal-3', respostas: [
    ['orcamento-pessoal-3-f1', 'facil', true, 'facil'],
    ['orcamento-pessoal-1-f1', 'facil', true, 'medio'],
    ['orcamento-pessoal-3-m1', 'medio', false, 'medio'],
  ] },
  { diasAtras: 1, horaLeitura: [19, 48], licaoId: 'juros-compostos-1', respostas: [
    ['juros-compostos-1-m1', 'medio', true, 'medio'],
    ['juros-compostos-1-m2', 'medio', false, 'medio'],
    ['juros-compostos-1-m3', 'medio', true, 'medio'],
  ] },
];

const XP: Record<Nivel, number> = { facil: 10, medio: 20, dificil: 35 };

export function criarHistoricoDoAlex(agora: Date): { progressos: Progresso[]; respostasQuiz: RespostaQuiz[]; usuarioBadges: UsuarioBadge[] } {
  const progressos: Progresso[] = [];
  const respostasQuiz: RespostaQuiz[] = [];
  for (const q of QUIZZES_DO_ALEX) {
    const trilhaId = q.licaoId.replace(/-\d$/, '');
    const [h, m] = q.horaLeitura;
    let acertos = 0;
    let xpQuiz = 0;
    q.respostas.forEach(([questaoId, nivelQuestao, acertou, nivelTrilhaApos], i) => {
      const xpGanho = acertou ? XP[nivelQuestao] : 2;
      acertos += acertou ? 1 : 0;
      xpQuiz += xpGanho;
      respostasQuiz.push({
        id: `demo-resposta-${questaoId}`, usuarioId: ID_ALEX, quizId: `${q.licaoId}-quiz`, questaoId, trilhaId, nivelQuestao,
        alternativaMarcada: 0, acertou, xpGanho, nivelTrilhaApos, respondidaEm: instanteRelativo(agora, q.diasAtras, h, m + 10 + i),
      });
    });
    progressos.push({
      id: `demo-progresso-${q.licaoId}`, usuarioId: ID_ALEX, trilhaId, licaoId: q.licaoId,
      leituraConcluidaEm: instanteRelativo(agora, q.diasAtras, h, m), quizConcluidoEm: instanteRelativo(agora, q.diasAtras, h, m + 12),
      acertos, xpGanho: xpQuiz, sincronizadoOffline: true,
    });
  }
  const usuarioBadges: UsuarioBadge[] = [
    { usuarioId: ID_ALEX, badgeId: 'primeiro_quiz', conquistadoEm: instanteRelativo(agora, 4, 19, 12) },
    { usuarioId: ID_ALEX, badgeId: 'primeira_trilha', conquistadoEm: instanteRelativo(agora, 2, 19, 12) },
  ];
  return { progressos, respostasQuiz, usuarioBadges };
}
```

O quiz de D−1 termina às 20h00 (19h48 + 12 min), igual à `ultimaAtividadeEm` do 2.8. A `alternativaMarcada` do histórico é ilustrativa: o passo 9 troca pelo índice coerente com o acerto de cada questão (correta quando acertou; outra quando errou), depois que as questões existirem.

- [ ] 2.10 Dados da pesquisa (`src/dados/demo/pesquisa.ts`, PRD 6.7). Respostas por índice da alternativa; as notas resultantes estão no comentário de cada linha.

```ts
import type { RespostaTeste, TesteDiagnostico } from '@/dados/tipos';
import { instanteRelativo } from '@/lib/fuso';
import { PERGUNTAS_DIAGNOSTICAS, VERSAO_TESTE } from './perguntasDiagnosticas';
import { ID_ALEX, JOVENS_FICTICIOS, PSEUDONIMO_ALEX } from './usuarios';

type Marcadas = [number, number, number];
interface Participante { usuarioId: string; pre: { diasAtras: number; marcadas: Marcadas }; pos?: { diasAtras: number; marcadas: Marcadas } }

const PARTICIPANTES: Participante[] = [
  { usuarioId: 'demo-bruna', pre: { diasAtras: 20, marcadas: [0, 2, 0] }, pos: { diasAtras: 2, marcadas: [0, 2, 1] } },  // 2 → 3
  { usuarioId: 'demo-caio', pre: { diasAtras: 19, marcadas: [0, 1, 2] }, pos: { diasAtras: 3, marcadas: [0, 2, 1] } },   // 1 → 3
  { usuarioId: 'demo-duda', pre: { diasAtras: 18, marcadas: [0, 2, 0] }, pos: { diasAtras: 1, marcadas: [0, 2, 0] } },   // 2 → 2
  { usuarioId: 'demo-enzo', pre: { diasAtras: 17, marcadas: [3, 3, 2] }, pos: { diasAtras: 2, marcadas: [0, 0, 1] } },   // 0 → 2
  { usuarioId: 'demo-gabi', pre: { diasAtras: 16, marcadas: [0, 2, 1] }, pos: { diasAtras: 1, marcadas: [0, 1, 1] } },   // 3 → 2
  { usuarioId: 'demo-heitor', pre: { diasAtras: 12, marcadas: [0, 0, 1] } },  // 2
  { usuarioId: ID_ALEX, pre: { diasAtras: 5, marcadas: [0, 1, 2] } },         // 1 (P1 correta, P2 "Exatamente o mesmo", P3 "Não sei")
  { usuarioId: 'demo-iara', pre: { diasAtras: 11, marcadas: [2, 2, 2] } },    // 1
  { usuarioId: 'demo-joao', pre: { diasAtras: 10, marcadas: [0, 2, 1] } },    // 3
  { usuarioId: 'demo-kaua', pre: { diasAtras: 9, marcadas: [3, 3, 2] } },     // 0
  { usuarioId: 'demo-lara', pre: { diasAtras: 8, marcadas: [0, 3, 0] } },     // 1
  { usuarioId: 'demo-mateus', pre: { diasAtras: 7, marcadas: [1, 2, 0] } },   // 1
];

export function criarPesquisa(agora: Date): { pseudonimos: Record<string, string>; testes: TesteDiagnostico[]; respostasTeste: RespostaTeste[] } {
  const pseudonimos: Record<string, string> = { [ID_ALEX]: PSEUDONIMO_ALEX };
  for (const j of JOVENS_FICTICIOS) pseudonimos[j.id] = j.pseudonimo;
  const testes: TesteDiagnostico[] = [];
  const respostasTeste: RespostaTeste[] = [];
  for (const p of PARTICIPANTES) {
    for (const [tipoTeste, dados] of [['pre', p.pre], ['pos', p.pos]] as const) {
      if (!dados) continue;
      const forma = tipoTeste === 'pre' ? 'A' : 'B';
      const perguntas = PERGUNTAS_DIAGNOSTICAS.filter((q) => q.forma === forma);
      const hora = p.usuarioId === ID_ALEX ? 19 : 18;
      const testeId = `demo-teste-${p.usuarioId}-${tipoTeste}`;
      let nota = 0;
      perguntas.forEach((pergunta, i) => {
        const marcada = dados.marcadas[i];
        const acertou = marcada === pergunta.alternativaCorreta;
        nota += acertou ? 1 : 0;
        respostasTeste.push({ id: `${testeId}-${pergunta.numero}`, testeId, perguntaId: pergunta.id, alternativaMarcada: marcada, acertou, respondidaEm: instanteRelativo(agora, dados.diasAtras, hora, 5 + i) });
      });
      testes.push({
        id: testeId, pseudonimo: pseudonimos[p.usuarioId], tipoTeste, forma, versao: VERSAO_TESTE,
        iniciadoEm: instanteRelativo(agora, dados.diasAtras, hora, 4), concluidoEm: instanteRelativo(agora, dados.diasAtras, hora, 8), pontuacaoTotal: nota,
      });
    }
  }
  return { pseudonimos, testes, respostasTeste };
}
```

- [ ] 2.11 Notificações e parâmetros iniciais (PRD 6.8):

```ts
// src/dados/demo/notificacoes.ts
import type { Notificacao } from '@/dados/tipos';
import { instanteRelativo } from '@/lib/fuso';
import { ID_ALEX } from './usuarios';

export function criarNotificacoes(agora: Date): Notificacao[] {
  return [
    { id: 'demo-notif-1', usuarioId: ID_ALEX, tipo: 'conquista', mensagem: 'Você ganhou a conquista Primeira Trilha!', link: '/conquistas', dataEnvio: instanteRelativo(agora, 2, 19, 13), lida: true },
    { id: 'demo-notif-2', usuarioId: ID_ALEX, tipo: 'sistema', mensagem: 'Nova trilha disponível: Inflação e Investimentos.', link: '/trilhas/inflacao-e-investimentos', dataEnvio: instanteRelativo(agora, 3, 9, 0), lida: true },
    { id: 'demo-notif-3', usuarioId: ID_ALEX, tipo: 'sistema', mensagem: 'Faltam 3 dias para a conquista Sequência de 7 dias. Continue estudando!', link: '/conquistas', dataEnvio: instanteRelativo(agora, 1, 20, 5), lida: false },
  ];
}
```

```ts
// src/dados/demo/parametros.ts
import type { ChaveParametro, ParametroSistema } from '@/dados/tipos';
import { instanteRelativo } from '@/lib/fuso';

export const PARAMETROS_PADRAO: Record<ChaveParametro, number> = {
  limite_inatividade_horas: 48,
  janela_motor: 5,
  limiar_subida: 80,
  limiar_descida: 40,
};

export function criarParametros(agora: Date): ParametroSistema[] {
  return (Object.keys(PARAMETROS_PADRAO) as ChaveParametro[]).map((chave) => ({
    id: `padrao-${chave}`, chave, valor: PARAMETROS_PADRAO[chave], alteradoPor: null, alteradoEm: instanteRelativo(agora, 30, 9, 0),
  }));
}
```

- [ ] 2.12 Banco local (`src/dados/bancoLocal.ts`) e montagem dos dados (`src/dados/demo/index.ts`):

```ts
// src/dados/demo/index.ts
import type { BancoDados } from '@/dados/bancoLocal';
import { criarHistoricoDoAlex } from './historico';
import { criarNotificacoes } from './notificacoes';
import { criarParametros } from './parametros';
import { criarPesquisa } from './pesquisa';
import { criarUsuarios } from './usuarios';

/** Aumente quando os dados de demonstração mudarem: o banco do aparelho é recriado. */
export const VERSAO_DADOS = 1;

export function criarDadosDemo(agora: Date): BancoDados {
  const historico = criarHistoricoDoAlex(agora);
  const pesquisa = criarPesquisa(agora);
  return {
    versao: VERSAO_DADOS,
    usuarios: criarUsuarios(agora),
    pseudonimos: pesquisa.pseudonimos,
    questoes: [], // o passo 9 troca por QUESTOES
    respostasQuiz: historico.respostasQuiz,
    progressos: historico.progressos,
    simulacoes: [],
    usuarioBadges: historico.usuarioBadges,
    notificacoes: criarNotificacoes(agora),
    testes: pesquisa.testes,
    respostasTeste: pesquisa.respostasTeste,
    parametros: criarParametros(agora),
  };
}
```

```ts
// src/dados/bancoLocal.ts
import type {
  Notificacao, ParametroSistema, Progresso, Questao, RespostaQuiz, RespostaTeste, Simulacao, TesteDiagnostico, Usuario, UsuarioBadge,
} from '@/dados/tipos';
import { criarDadosDemo, VERSAO_DADOS } from '@/dados/demo';
import { agora } from '@/lib/relogio';

const CHAVE = 'efg:dados';

export interface BancoDados {
  versao: number;
  usuarios: Usuario[];
  pseudonimos: Record<string, string>; // usuarioId → pseudônimo, separado do usuário (RNF06)
  questoes: Questao[];
  respostasQuiz: RespostaQuiz[];
  progressos: Progresso[];
  simulacoes: Simulacao[];
  usuarioBadges: UsuarioBadge[];
  notificacoes: Notificacao[];
  testes: TesteDiagnostico[];
  respostasTeste: RespostaTeste[];
  parametros: ParametroSistema[];
}

let memoria: BancoDados | null = null;
let armazenamentoDisponivel = true;

function gravar(banco: BancoDados): void {
  memoria = banco;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(banco));
  } catch {
    armazenamentoDisponivel = false;
  }
}

export function carregarBanco(): BancoDados {
  if (memoria) return memoria;
  try {
    const bruto = localStorage.getItem(CHAVE);
    const salvo = bruto ? (JSON.parse(bruto) as BancoDados) : null;
    if (salvo?.versao === VERSAO_DADOS) return (memoria = salvo);
  } catch {
    armazenamentoDisponivel = false;
  }
  const novo = criarDadosDemo(agora());
  gravar(novo);
  return novo;
}

/** Aplica uma alteração e grava. Devolve o que a função devolver. */
export function alterarBanco<T>(alteracao: (banco: BancoDados) => T): T {
  const banco = carregarBanco();
  const resultado = alteracao(banco);
  gravar(banco);
  return resultado;
}

export function reiniciarBanco(): void {
  gravar(criarDadosDemo(agora()));
}

export function armazenamentoOk(): boolean {
  return armazenamentoDisponivel;
}
```

- [ ] 2.13 Teste dos dados de demonstração (`src/dados/demo/demo.test.ts`):

```ts
import { describe, expect, it } from 'vitest';
import { diaNoFuso } from '@/lib/fuso';
import { criarDadosDemo } from '.';
import { ID_ALEX } from './usuarios';

const agora = new Date('2026-11-04T15:00:00Z'); // quarta-feira, 12h00 em São Paulo

describe('dados de demonstração (PRD 6.3, 6.4, 6.7)', () => {
  const banco = criarDadosDemo(agora);
  const alex = banco.usuarios.find((u) => u.id === ID_ALEX)!;

  it('12 jovens e 1 administrador', () => {
    expect(banco.usuarios.filter((u) => u.papel === 'jovem')).toHaveLength(12);
    expect(banco.usuarios.filter((u) => u.papel === 'admin')).toHaveLength(1);
  });
  it('Alex: 120 XP, igual à soma das respostas, sequência de 4 dias até ontem', () => {
    const soma = banco.respostasQuiz.filter((r) => r.usuarioId === ID_ALEX).reduce((s, r) => s + r.xpGanho, 0);
    expect(alex.xpTotal).toBe(120);
    expect(soma).toBe(120);
    expect(alex.diasStreak).toBe(4);
    expect(alex.ultimoDiaUso).toBe(diaNoFuso(new Date('2026-11-03T15:00:00Z')));
  });
  it('Alex: 4 quizzes concluídos, nenhum com 3 acertos, e as 2 conquistas', () => {
    const doAlex = banco.progressos.filter((p) => p.usuarioId === ID_ALEX);
    expect(doAlex.filter((p) => p.quizConcluidoEm)).toHaveLength(4);
    expect(doAlex.every((p) => p.acertos < 3)).toBe(true);
    expect(banco.usuarioBadges.map((b) => b.badgeId).sort()).toEqual(['primeira_trilha', 'primeiro_quiz']);
  });
  it('pesquisa: 12 pré-testes, 5 pós-testes, pseudônimos únicos e notas do PRD', () => {
    expect(banco.testes.filter((t) => t.tipoTeste === 'pre')).toHaveLength(12);
    expect(banco.testes.filter((t) => t.tipoTeste === 'pos')).toHaveLength(5);
    expect(new Set(Object.values(banco.pseudonimos)).size).toBe(12);
    const preAlex = banco.testes.find((t) => t.pseudonimo === banco.pseudonimos[ID_ALEX] && t.tipoTeste === 'pre')!;
    expect(preAlex.pontuacaoTotal).toBe(1);
    expect(banco.respostasTeste).toHaveLength(51);
  });
});
```

- [ ] 2.14 Primeiro repositório (conteúdo), com a latência simulada do PRD 6.2:

```ts
// src/dados/repositorios/local/comum.ts
import { lerAparelho } from '@/dados/aparelho';
import { ID_ALEX } from '@/dados/demo/usuarios';

export const LATENCIA_MS = import.meta.env.MODE === 'test' ? 0 : 300;

/** Devolve uma cópia, depois da latência simulada, para a tela nunca alterar o banco por engano. */
export async function responder<T>(valor: T): Promise<T> {
  if (LATENCIA_MS > 0) await new Promise((resolver) => setTimeout(resolver, LATENCIA_MS));
  return structuredClone(valor);
}

/** Usuário da sessão local. Até o passo 6, o app age como o jovem de demonstração. */
export function usuarioDaSessao(): string {
  return lerAparelho().sessaoUsuarioId ?? ID_ALEX;
}
```

```ts
// src/dados/repositorios/local/conteudo.ts
import { BADGES } from '@/dados/demo/badges';
import { LICOES, QUIZZES, TRILHAS } from '@/dados/demo/trilhas';
import type { RepositorioConteudo } from '../contratos';
import { responder } from './comum';

export const conteudoLocal: RepositorioConteudo = {
  listarTrilhas: () => responder(TRILHAS),
  listarLicoes: () => responder(LICOES),
  listarQuizzes: () => responder(QUIZZES),
  listarBadges: () => responder(BADGES),
};
```

Em `contratos.ts`, criar agora só `RepositorioConteudo` e `Repositorios = { conteudo: RepositorioConteudo }`; cada passo acrescenta a sua parte, até chegar à forma final da seção 4. `src/dados/repositorios/local/index.ts` exporta `repositoriosLocais: Repositorios = { conteudo: conteudoLocal }`, e `src/dados/repositorios/index.ts`:

```ts
import type { Repositorios } from './contratos';
import { repositoriosLocais } from './local';

// E2.5: escolhe entre local e supabase pela variável VITE_FONTE_DADOS.
export const repositorios: Repositorios = repositoriosLocais;
```

Hooks (`src/hooks/dados/chaves.ts` e `src/hooks/dados/useConteudo.ts`):

```ts
// chaves.ts
export const chaves = {
  trilhas: ['trilhas'], licoes: ['licoes'], quizzes: ['quizzes'], badges: ['badges'],
  sessao: ['sessao'], usuario: ['usuario'], progresso: ['progresso'], respostas: ['respostas'],
  testes: ['testes'], simulacoes: ['simulacoes'], conquistas: ['conquistas'], ranking: ['ranking'],
  notificacoes: ['notificacoes'], admin: ['admin'],
} as const;
```

```ts
// useConteudo.ts
import { useQuery } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import { chaves } from './chaves';

export const useTrilhas = () => useQuery({ queryKey: chaves.trilhas, queryFn: () => repositorios.conteudo.listarTrilhas(), staleTime: Infinity });
export const useLicoes = () => useQuery({ queryKey: chaves.licoes, queryFn: () => repositorios.conteudo.listarLicoes(), staleTime: Infinity });
export const useQuizzes = () => useQuery({ queryKey: chaves.quizzes, queryFn: () => repositorios.conteudo.listarQuizzes(), staleTime: Infinity });
export const useBadges = () => useQuery({ queryKey: chaves.badges, queryFn: () => repositorios.conteudo.listarBadges(), staleTime: Infinity });
```

- [ ] 2.15 Mostrar os dados numa tela provisória: em `/inicio`, abaixo do título, listar as 4 trilhas (com `useTrilhas`, mostrando `Skeleton` enquanto carrega) e a quantidade de usuários do banco local (`carregarBanco().usuarios.length`). Essa tela some no passo 10.

- [ ] 2.16 Aviso de armazenamento (PRD 6.2): no `main.tsx`, depois do `createRoot(...).render(...)`, chamar `carregarBanco()` e, se `armazenamentoOk()` for falso, `toast.warning('Seu progresso não será salvo neste navegador.')` (com `setTimeout` de 0 ms, para o `Toaster` já existir).

Conferir: `npm run test` (formatos e dados de demonstração passam), `npm run lint`, `npm run build`.

O que o usuário testa:
1. `npm run dev`, abrir `/inicio`: aparecem as 4 trilhas depois de um carregamento curto e "13 usuários".
2. DevTools → Application → Local Storage: existe a chave `efg:dados`. Recarregar a página mantém os mesmos dados.

Commit sugerido: `feat: tipos, dados de demonstração, banco local e formatos pt-BR`.

---
## Passo 3 — Regras dos simuladores, com testes (Essencial)

Ler antes: PRD 2.7 e 2.8; instruções do projeto (Juros compostos; Cartão de crédito).

Arquivos:
- Criar: `src/regras/simuladores.test.ts`, `src/regras/simuladores.ts`.

Tarefas:

- [ ] 3.1 Escrever os testes (`src/regras/simuladores.test.ts`). Os valores esperados foram conferidos fora do app; os centavos evitam erro de arredondamento:

```ts
import { describe, expect, it } from 'vitest';
import {
  calcularMontante, ErroSemRotativo, simularFatura, simularJuros, TAXA_SUGERIDA, taxaAnualEquivalente, taxaMensalEquivalente,
} from './simuladores';

const centavos = (valor: number) => Math.round(valor * 100);
const juros1 = { valorInicial: 1000, aporteMensal: 100, taxaPercentual: 1, unidadeTaxa: 'mes', prazo: 12, unidadePrazo: 'meses' } as const;

describe('juros compostos (RN01, RN06)', () => {
  it('RN01: R$ 1.000 + R$ 100/mês a 1% ao mês em 12 meses = R$ 2.395,08 (aceite fixo)', () => {
    const r = simularJuros(juros1);
    expect(centavos(r.montante)).toBe(239508);
    expect(centavos(r.totalInvestido)).toBe(220000);
    expect(centavos(r.totalJuros)).toBe(19508);
  });
  it('RN01: taxa 0 usa M = C + A × t', () => {
    expect(centavos(calcularMontante(1000, 100, 0, 12))).toBe(220000);
    expect(centavos(simularJuros({ ...juros1, taxaPercentual: 0 }).montante)).toBe(220000);
  });
  it('RN01: taxa anual vira mensal por equivalência, nunca dividida por 12', () => {
    const r = simularJuros({ ...juros1, aporteMensal: 0, taxaPercentual: 10, unidadeTaxa: 'ano' });
    expect(centavos(r.montante)).toBe(110000);
    expect(centavos(calcularMontante(1000, 0, 0.1 / 12, 12))).toBe(110471); // o erro que a regra evita
    expect(taxaMensalEquivalente(0.1)).toBeCloseTo(0.0079741404, 9);
    expect(taxaAnualEquivalente(0.01)).toBeCloseTo(0.1268250301, 9);
  });
  it('RN01: prazo de 1 ano dá o mesmo que 12 meses', () => {
    const r = simularJuros({ ...juros1, prazo: 1, unidadePrazo: 'anos' });
    expect(r.prazoMeses).toBe(12);
    expect(centavos(r.montante)).toBe(239508);
  });
  it('RN01: evolução mês a mês, do mês 0 ao prazo', () => {
    const r = simularJuros(juros1);
    expect(r.evolucao).toHaveLength(13);
    expect(r.evolucao[0]).toEqual({ mes: 0, saldo: 1000, investido: 1000 });
    expect(centavos(r.evolucao[12].saldo)).toBe(239508);
    expect(r.evolucao[12].investido).toBe(2200);
  });
  it('RN06: taxa sugerida de exemplo numa constante única', () => {
    expect(TAXA_SUGERIDA).toMatchObject({ percentual: 10, unidade: 'ano', ehExemplo: true, dataReferencia: null });
    expect(TAXA_SUGERIDA.texto).toBe('Valor de exemplo — será trocado pelo CDI anualizado base 252 do Banco Central');
  });
});

describe('fatura do cartão (RN05)', () => {
  const base = { valorFatura: 1000, pagamentoMinimo: 150, taxaRotativoPercentual: 15 };

  it('RN05: sem teto — parcelamento de 9% ao mês em 12 parcelas', () => {
    const r = simularFatura({ ...base, taxaParcelamentoPercentual: 9, parcelas: 12 });
    expect(r.tetoAplicado).toBe(false);
    expect(centavos(r.pagandoMinimo.jurosRotativo)).toBe(12750);
    expect(centavos(r.pagandoMinimo.saldoParcelado)).toBe(97750);
    expect(centavos(r.pagandoMinimo.parcela)).toBe(13651);
    expect(centavos(r.pagandoMinimo.totalPago)).toBe(178810);
    expect(centavos(r.pagandoMinimo.juros)).toBe(78810);
    expect(centavos(r.custoExtra)).toBe(78810);
    expect(r.pagandoTotal).toEqual({ totalPago: 1000, juros: 0 });
  });
  it('RN05: teto legal — juros limitados a 100% do saldo do rotativo (parcelas somam 2 × saldo)', () => {
    const r = simularFatura({ ...base, taxaParcelamentoPercentual: 12, parcelas: 24 });
    expect(r.tetoAplicado).toBe(true);
    expect(centavos(r.pagandoMinimo.parcela)).toBe(7083);
    expect(centavos(r.pagandoMinimo.somaParcelas)).toBe(170000);
    expect(centavos(r.pagandoMinimo.juros)).toBe(85000);
    expect(centavos(r.pagandoMinimo.totalPago)).toBe(185000);
    expect(r.taxaParcelamentoEfetiva * 100).toBeCloseTo(5.0, 2);
  });
  it('RN05: parcelamento com taxa 0', () => {
    const r = simularFatura({ valorFatura: 1000, pagamentoMinimo: 150, taxaRotativoPercentual: 10, taxaParcelamentoPercentual: 0, parcelas: 10 });
    expect(centavos(r.pagandoMinimo.parcela)).toBe(9350);
    expect(centavos(r.pagandoMinimo.totalPago)).toBe(108500);
    expect(centavos(r.pagandoMinimo.juros)).toBe(8500);
  });
  it('RN05: tabela com o mês 0, o mês 1 no rotativo e uma linha por parcela, até saldo zero', () => {
    const r = simularFatura({ ...base, taxaParcelamentoPercentual: 9, parcelas: 12 });
    expect(r.tabela).toHaveLength(14);
    expect(r.tabela[0]).toMatchObject({ mes: 0, situacao: 'Pagamento mínimo', pagamento: 150, juros: 0, saldo: 850 });
    expect(r.tabela[1]).toMatchObject({ mes: 1, situacao: 'Rotativo (até a próxima fatura)', pagamento: 0 });
    expect(r.tabela[13]).toMatchObject({ mes: 13, situacao: 'Parcela 12 de 12', saldo: 0 });
  });
  it('RN05: mínimo maior ou igual à fatura não tem rotativo', () => {
    expect(() => simularFatura({ ...base, pagamentoMinimo: 1000, taxaParcelamentoPercentual: 9, parcelas: 12 })).toThrow(ErroSemRotativo);
  });
});
```

- [ ] 3.2 Rodar `npm run test`: falha porque `simuladores.ts` não existe.

- [ ] 3.3 Implementar `src/regras/simuladores.ts`:

```ts
import type { EntradaFatura, EntradaJuros } from '@/dados/tipos';

/** RN06: taxa sugerida. Trocar aqui pelo CDI anualizado base 252 real, com a data de referência e a fonte. */
export const TAXA_SUGERIDA = {
  percentual: 10,
  unidade: 'ano' as const,
  ehExemplo: true,
  dataReferencia: null as string | null, // dd/mm/aaaa, quando for o CDI real
  fonte: null as string | null,
  texto: 'Valor de exemplo — será trocado pelo CDI anualizado base 252 do Banco Central',
};

export const AVISO_JUROS = 'Simulação educativa. Não constitui recomendação de investimento. A taxa não é atualizada automaticamente e o cálculo não desconta Imposto de Renda nem IOF.';
export const AVISO_FATURA = 'Simulação educativa e simplificada. Não constitui recomendação financeira. Não considera multa, juros de mora nem IOF.';

export const taxaMensalEquivalente = (taxaAnual: number) => Math.pow(1 + taxaAnual, 1 / 12) - 1;
export const taxaAnualEquivalente = (taxaMensal: number) => Math.pow(1 + taxaMensal, 12) - 1;

/** RN01: M = C × (1 + i)^t + A × ((1 + i)^t − 1) / i, com aporte no fim de cada mês. */
export function calcularMontante(valorInicial: number, aporteMensal: number, taxaMensal: number, meses: number): number {
  if (taxaMensal === 0) return valorInicial + aporteMensal * meses;
  const fator = Math.pow(1 + taxaMensal, meses);
  return valorInicial * fator + aporteMensal * ((fator - 1) / taxaMensal);
}

export interface PontoEvolucao { mes: number; saldo: number; investido: number }
export interface ResultadoJuros { montante: number; totalInvestido: number; totalJuros: number; taxaMensal: number; prazoMeses: number; evolucao: PontoEvolucao[] }

export function simularJuros(e: EntradaJuros): ResultadoJuros {
  const taxaMensal = e.unidadeTaxa === 'mes' ? e.taxaPercentual / 100 : taxaMensalEquivalente(e.taxaPercentual / 100);
  const prazoMeses = e.unidadePrazo === 'meses' ? e.prazo : e.prazo * 12;
  const evolucao = Array.from({ length: prazoMeses + 1 }, (_, mes) => ({
    mes,
    saldo: calcularMontante(e.valorInicial, e.aporteMensal, taxaMensal, mes),
    investido: e.valorInicial + e.aporteMensal * mes,
  }));
  const montante = evolucao[prazoMeses].saldo;
  const totalInvestido = evolucao[prazoMeses].investido;
  return { montante, totalInvestido, totalJuros: montante - totalInvestido, taxaMensal, prazoMeses, evolucao };
}

export class ErroSemRotativo extends Error {
  constructor() {
    super('Com esse pagamento não sobra saldo para o rotativo: não há incidência de juros do rotativo.');
  }
}

export interface LinhaFatura { mes: number; situacao: string; pagamento: number; juros: number; saldo: number }
export interface ResultadoFatura {
  pagandoTotal: { totalPago: number; juros: number };
  pagandoMinimo: { totalPago: number; juros: number; jurosRotativo: number; saldoRotativo: number; saldoParcelado: number; parcela: number; somaParcelas: number };
  custoExtra: number;
  tetoAplicado: boolean;
  taxaParcelamentoEfetiva: number; // fração ao mês usada na tabela
  tabela: LinhaFatura[];
}

/** Tabela Price: parcela de um valor presente em n meses, primeira parcela um mês depois. */
export const parcelaPrice = (valor: number, taxa: number, n: number) => (taxa === 0 ? valor / n : (valor * taxa) / (1 - Math.pow(1 + taxa, -n)));

/** Taxa que gera uma parcela (bisseção; é o mesmo valor da função TAXA do Excel). */
export function taxaPorParcela(valor: number, parcela: number, n: number, taxaMaxima: number): number {
  let baixo = 0;
  let alto = taxaMaxima;
  for (let k = 0; k < 200; k++) {
    const meio = (baixo + alto) / 2;
    if (parcelaPrice(valor, meio, n) > parcela) alto = meio;
    else baixo = meio;
  }
  return (baixo + alto) / 2;
}

/** RN05: rotativo só até a próxima fatura (CMN 4.549/2017), depois Price; juros totais ≤ 100% do saldo (Lei 14.690/2023). */
export function simularFatura(e: EntradaFatura): ResultadoFatura {
  if (e.pagamentoMinimo >= e.valorFatura) throw new ErroSemRotativo();
  const saldoRotativo = e.valorFatura - e.pagamentoMinimo;
  const taxaRotativo = e.taxaRotativoPercentual / 100;
  const taxaParcelamento = e.taxaParcelamentoPercentual / 100;
  const n = e.parcelas;
  const jurosRotativo = saldoRotativo * taxaRotativo;
  const saldoParcelado = saldoRotativo + jurosRotativo;

  let parcela = parcelaPrice(saldoParcelado, taxaParcelamento, n);
  let taxaEfetiva = taxaParcelamento;
  const tetoAplicado = n * parcela - saldoRotativo > saldoRotativo;
  if (tetoAplicado) {
    parcela = (2 * saldoRotativo) / n;
    taxaEfetiva = taxaPorParcela(saldoParcelado, parcela, n, taxaParcelamento);
  }
  const somaParcelas = n * parcela;
  const juros = somaParcelas - saldoRotativo;

  const tabela: LinhaFatura[] = [
    { mes: 0, situacao: 'Pagamento mínimo', pagamento: e.pagamentoMinimo, juros: 0, saldo: saldoRotativo },
    { mes: 1, situacao: 'Rotativo (até a próxima fatura)', pagamento: 0, juros: jurosRotativo, saldo: saldoParcelado },
  ];
  let saldo = saldoParcelado;
  for (let k = 1; k <= n; k++) {
    const jurosDoMes = saldo * taxaEfetiva;
    saldo = saldo + jurosDoMes - parcela;
    tabela.push({ mes: k + 1, situacao: `Parcela ${k} de ${n}`, pagamento: parcela, juros: jurosDoMes, saldo: k === n ? 0 : saldo });
  }

  return {
    pagandoTotal: { totalPago: e.valorFatura, juros: 0 },
    pagandoMinimo: { totalPago: e.pagamentoMinimo + somaParcelas, juros, jurosRotativo, saldoRotativo, saldoParcelado, parcela, somaParcelas },
    custoExtra: juros,
    tetoAplicado,
    taxaParcelamentoEfetiva: taxaEfetiva,
    tabela,
  };
}
```

- [ ] 3.4 Rodar `npm run test`: todos passam.

Conferir: `npm run test`, `npm run lint`, `npm run build`.

O que o usuário testa:
1. `npm run test` e ver os casos `RN01` e `RN05` passando, incluindo R$ 2.395,08.
2. Opcional, para o artigo (PRD 7.3): conferir os mesmos casos numa planilha independente antes de citar qualquer número.

Commit sugerido: `feat: regras dos simuladores de juros compostos e fatura (RN01, RN05, RN06)`.

---

## Passo 4 — T14 Juros compostos e T13 Simuladores (Essencial)

Ler antes: PRD 2.6, 2.7, 5.6 e 7.4.

Arquivos:
- Criar: `src/components/CampoMoeda.tsx`, `src/components/AvisoEducativo.tsx`, `src/pages/jovem/esquemasSimuladores.ts`, `src/pages/jovem/esquemasSimuladores.test.ts`, `src/pages/jovem/JurosCompostos.tsx`, `src/pages/jovem/Simuladores.tsx`, `src/dados/repositorios/local/simulacoes.ts`, `src/hooks/dados/useSimulacoes.ts`.
- Modificar: `src/dados/repositorios/contratos.ts` (acrescentar `RepositorioSimulacoes`), `src/dados/repositorios/local/index.ts`, `src/app/rotas.tsx`.

Tarefas:

- [ ] 4.1 Campo de reais com máscara (a digitação preenche a partir dos centavos; teclado numérico no celular):

```tsx
// src/components/CampoMoeda.tsx
import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { formatarDecimal } from '@/lib/formatacao';

type Props = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> & {
  value: number | null;
  onChange: (valor: number | null) => void;
};

export function CampoMoeda({ value, onChange, ...props }: Props) {
  return (
    <div className="relative">
      <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
      <Input
        {...props}
        inputMode="numeric"
        className="pl-9 tabular-nums"
        value={value === null ? '' : formatarDecimal(value)}
        onChange={(evento) => {
          const digitos = evento.target.value.replace(/\D/g, '');
          onChange(digitos ? Number(digitos) / 100 : null);
        }}
      />
    </div>
  );
}
```

- [ ] 4.2 Esquemas de validação com as mensagens no campo (PRD 2.7 e 2.8). Primeiro o teste (`src/pages/jovem/esquemasSimuladores.test.ts`):

```ts
import { describe, expect, it } from 'vitest';
import { esquemaFatura, esquemaJuros } from './esquemasSimuladores';

/** Primeira mensagem de cada campo, como o formulário mostra. */
function mensagens(r: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  const porCampo: Record<string, string> = {};
  for (const issue of r.error?.issues ?? []) {
    const campo = String(issue.path[0]);
    if (!(campo in porCampo)) porCampo[campo] = issue.message;
  }
  return porCampo;
}

const jurosValido = { valorInicial: 1000, aporteMensal: 100, taxa: '1,00', unidadeTaxa: 'mes', prazo: '12', unidadePrazo: 'meses' };

describe('validação dos simuladores', () => {
  it('juros: aceita o caso de aceite', () => {
    expect(esquemaJuros.safeParse(jurosValido).success).toBe(true);
  });
  it('juros: campos vazios, negativos e prazo menor que 1 mês bloqueiam', () => {
    expect(mensagens(esquemaJuros.safeParse({ ...jurosValido, valorInicial: null }))).toMatchObject({ valorInicial: 'Informe o valor inicial' });
    expect(mensagens(esquemaJuros.safeParse({ ...jurosValido, aporteMensal: -1 }))).toMatchObject({ aporteMensal: 'O valor não pode ser negativo' });
    expect(mensagens(esquemaJuros.safeParse({ ...jurosValido, taxa: '' }))).toMatchObject({ taxa: 'Informe a taxa de juros' });
    expect(mensagens(esquemaJuros.safeParse({ ...jurosValido, taxa: '-2' }))).toMatchObject({ taxa: 'A taxa não pode ser negativa' });
    expect(mensagens(esquemaJuros.safeParse({ ...jurosValido, prazo: '0' }))).toMatchObject({ prazo: 'O prazo mínimo é de 1 mês' });
    expect(mensagens(esquemaJuros.safeParse({ ...jurosValido, valorInicial: 0, aporteMensal: 0 }))).toMatchObject({ valorInicial: 'Informe um valor inicial ou um aporte maior que zero' });
  });
  it('fatura: mínimo maior ou igual à fatura bloqueia com o aviso do rotativo', () => {
    const r = esquemaFatura.safeParse({ valorFatura: 1000, pagamentoMinimo: 1000, taxaRotativo: '15', taxaParcelamento: '9', parcelas: 12 });
    expect(mensagens(r)).toMatchObject({ pagamentoMinimo: 'Com esse pagamento não sobra saldo para o rotativo: não há incidência de juros do rotativo.' });
  });
  it('fatura: parcelas fora de 2 a 24 bloqueiam', () => {
    const r = esquemaFatura.safeParse({ valorFatura: 1000, pagamentoMinimo: 150, taxaRotativo: '15', taxaParcelamento: '9', parcelas: 30 });
    expect(mensagens(r)).toMatchObject({ parcelas: 'Escolha de 2 a 24 parcelas' });
  });
});
```

Rodar e ver falhar. Depois implementar `src/pages/jovem/esquemasSimuladores.ts`:

```ts
import { z } from 'zod';
import type { EntradaFatura, EntradaJuros } from '@/dados/tipos';
import { formatarMoeda, paraNumero } from '@/lib/formatacao';
import { ErroSemRotativo } from '@/regras/simuladores';

const campoMoeda = (obrigatorio: string, maximo: number) =>
  z.number({ error: obrigatorio }).min(0, 'O valor não pode ser negativo').max(maximo, `Use no máximo ${formatarMoeda(maximo)}`);

const campoTaxa = (obrigatorio: string) =>
  z.string().trim().min(1, obrigatorio)
    .refine((t) => !t.startsWith('-'), 'A taxa não pode ser negativa')
    .refine((t) => /^\d{1,3}(,\d{1,2})?$/.test(t), 'Use até 2 casas decimais, com vírgula (ex.: 10,50)')
    .refine((t) => (paraNumero(t) ?? 0) <= 100, 'A taxa deve ser de no máximo 100%');

export const esquemaJuros = z.object({
  valorInicial: campoMoeda('Informe o valor inicial', 10_000_000),
  aporteMensal: campoMoeda('Informe o aporte mensal', 1_000_000),
  taxa: campoTaxa('Informe a taxa de juros'),
  unidadeTaxa: z.enum(['mes', 'ano']),
  prazo: z.string().trim().min(1, 'Informe o prazo').regex(/^\d+$/, 'Use um número inteiro'),
  unidadePrazo: z.enum(['meses', 'anos']),
}).superRefine((v, ctx) => {
  const meses = v.unidadePrazo === 'anos' ? Number(v.prazo) * 12 : Number(v.prazo);
  if (meses < 1) ctx.addIssue({ code: 'custom', path: ['prazo'], message: 'O prazo mínimo é de 1 mês' });
  if (meses > 600) ctx.addIssue({ code: 'custom', path: ['prazo'], message: 'O prazo máximo é de 50 anos (600 meses)' });
  if (v.valorInicial === 0 && v.aporteMensal === 0) {
    ctx.addIssue({ code: 'custom', path: ['valorInicial'], message: 'Informe um valor inicial ou um aporte maior que zero' });
  }
});
export type FormularioJuros = z.input<typeof esquemaJuros>;
export const paraEntradaJuros = (v: z.output<typeof esquemaJuros>): EntradaJuros => ({
  valorInicial: v.valorInicial, aporteMensal: v.aporteMensal, taxaPercentual: paraNumero(v.taxa)!,
  unidadeTaxa: v.unidadeTaxa, prazo: Number(v.prazo), unidadePrazo: v.unidadePrazo,
});

export const esquemaFatura = z.object({
  valorFatura: z.number({ error: 'Informe o valor da fatura' }).positive('O valor precisa ser maior que zero').max(1_000_000, 'Use no máximo R$ 1.000.000,00'),
  pagamentoMinimo: z.number({ error: 'Informe o pagamento mínimo' }).positive('O valor precisa ser maior que zero'),
  taxaRotativo: campoTaxa('Informe a taxa do rotativo'),
  taxaParcelamento: campoTaxa('Informe a taxa do parcelamento'),
  parcelas: z.number({ error: 'Escolha o número de parcelas' }).int().min(2, 'Escolha de 2 a 24 parcelas').max(24, 'Escolha de 2 a 24 parcelas'),
}).superRefine((v, ctx) => {
  if (v.pagamentoMinimo >= v.valorFatura) ctx.addIssue({ code: 'custom', path: ['pagamentoMinimo'], message: new ErroSemRotativo().message });
});
export type FormularioFatura = z.input<typeof esquemaFatura>;
export const paraEntradaFatura = (v: z.output<typeof esquemaFatura>): EntradaFatura => ({
  valorFatura: v.valorFatura, pagamentoMinimo: v.pagamentoMinimo, taxaRotativoPercentual: paraNumero(v.taxaRotativo)!,
  taxaParcelamentoPercentual: paraNumero(v.taxaParcelamento)!, parcelas: v.parcelas,
});
```

Rodar e ver passar.

- [ ] 4.3 Repositório das simulações (guardadas no aparelho; até 10 na lista). Em `contratos.ts`, acrescentar `RepositorioSimulacoes` (forma da seção 4) e o campo `simulacoes` em `Repositorios`.

```ts
// src/dados/repositorios/local/simulacoes.ts
import type { Simulacao } from '@/dados/tipos';
import { alterarBanco, carregarBanco } from '@/dados/bancoLocal';
import { agora } from '@/lib/relogio';
import type { RepositorioSimulacoes } from '../contratos';
import { responder, usuarioDaSessao } from './comum';

export const simulacoesLocal: RepositorioSimulacoes = {
  minhasSimulacoes: () =>
    responder(
      carregarBanco().simulacoes
        .filter((s) => s.usuarioId === usuarioDaSessao())
        .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
        .slice(0, 10),
    ),
  async salvar(simulacao) {
    alterarBanco((banco) => {
      banco.simulacoes.push({ ...simulacao, id: crypto.randomUUID(), usuarioId: usuarioDaSessao(), criadaEm: agora().toISOString() } as Simulacao);
    });
    await responder(null);
  },
};
```

`src/hooks/dados/useSimulacoes.ts`: `useSimulacoes()` (consulta com `chaves.simulacoes`) e `useSalvarSimulacao()` (mutação que invalida `chaves.simulacoes`).

- [ ] 4.4 Aviso fixo (`src/components/AvisoEducativo.tsx`): caixa com ícone `Info` (`aria-hidden`), `role="note"`, texto recebido por prop, sempre visível (não fecha).

- [ ] 4.5 Tela T14 (`src/pages/jovem/JurosCompostos.tsx`), com React Hook Form (`zodResolver(esquemaJuros)`, `mode: 'onSubmit'`) e os componentes do shadcn:
  - Valores iniciais: `valorInicial: null`, `aporteMensal: null`, `taxa: formatarDecimal(TAXA_SUGERIDA.percentual)` ("10,00"), `unidadeTaxa: 'ano'`, `prazo: ''`, `unidadePrazo: 'meses'`.
  - Campos: Valor inicial e Aporte mensal com `CampoMoeda`; Taxa de juros (`Input` com `inputMode="decimal"`) com `ToggleGroup` "% ao mês" / "% ao ano"; Prazo (`Input` com `inputMode="numeric"`) com `ToggleGroup` "meses" / "anos". Cada campo com `Label` e a mensagem de erro ligada por `aria-describedby` (o `FormMessage` do shadcn já faz isso).
  - Abaixo da taxa, sempre: `TAXA_SUGERIDA.texto`. E a equivalência, quando a taxa digitada for válida: com "% ao ano", "Equivale a X% ao mês" (`formatarPercentual(taxaMensalEquivalente(t/100) * 100)`); com "% ao mês", "Equivale a X% ao ano".
  - Botões: Calcular (`type="submit"`, então Enter calcula) e Limpar (volta aos valores iniciais e esconde o resultado).
  - Ao calcular: `simularJuros(paraEntradaJuros(valores))`, guardar o resultado no estado da tela e salvar com `useSalvarSimulacao()` (`tipoSimulacao: 'juros_compostos'`, `parametros: entrada`, `resultadoFinal: resultado.montante`).
  - Resultado: três números em cards (Montante final, Total investido, Total de juros) com `formatarMoeda` e `tabular-nums`; gráfico de área do Recharts dentro de `ResponsiveContainer` (altura 240 px), eixo X com o mês, eixo Y com `formatarMoedaCompacta`, duas séries ("Saldo" na cor primária e "Total investido" em cinza), legenda e tooltip com `formatarMoeda`. O contêiner do gráfico tem `role="img"` e `aria-label` com o resumo ("Saldo de R$ 2.395,08 no mês 12, contra R$ 2.200,00 investidos").
  - Slider de prazo (aparece depois do primeiro cálculo): de 1 a 600 em "meses" e de 1 a 50 em "anos". Ao mover: atualiza o campo Prazo (`setValue`) e recalcula o resultado na hora, sem salvar nova simulação.
  - "Ver tabela mês a mês" (Desejável): botão que mostra uma `Table` com mês, saldo e investido.
  - Aviso fixo: `<AvisoEducativo texto={AVISO_JUROS} />`, visível antes e depois do cálculo.
  - Reabrir uma simulação: se a rota receber `location.state.parametros` (vindo da T13), preencher os campos e calcular ao abrir.

- [ ] 4.6 Tela T13 (`src/pages/jovem/Simuladores.tsx`):
  - Dois cards com `Link`: "Juros compostos" ("Veja o seu dinheiro crescer com juros sobre juros") e "Fatura do cartão" ("Compare pagar o total com pagar só o mínimo").
  - "Últimas simulações": lista de `useSimulacoes()`; cada item com ícone (`TrendingUp` ou `CreditCard`), resumo e data (`formatarData`). Resumo de juros: `R$ 1.000,00 + R$ 100,00/mês · 1,00% ao mês · 12 meses → R$ 2.395,08`. Resumo do cartão: `Fatura de R$ 1.000,00 · mínimo de R$ 150,00 · 12 parcelas → R$ 1.788,10`. Tocar navega para o simulador com `state: { parametros }`.
  - Carregando: três `Skeleton`. Vazio: "Você ainda não fez nenhuma simulação."

- [ ] 4.7 Rotas: trocar as telas provisórias de `/simuladores` e `/simuladores/juros-compostos` por `Simuladores` e `JurosCompostos`, carregadas com `lazy` (o Recharts fica fora do pacote inicial):

```tsx
{ path: '/simuladores/juros-compostos', lazy: async () => ({ Component: (await import('@/pages/jovem/JurosCompostos')).JurosCompostos }) },
```

Conferir: `npm run test` (esquemas e regras), `npm run lint`, `npm run build`; no navegador, os critérios de aceite de T13 e T14 (PRD 2.6 e 2.7).

O que o usuário testa (`npm run dev`, `/simuladores/juros-compostos`):
1. Valor inicial R$ 1.000,00, aporte R$ 100,00, taxa 1,00 "% ao mês", prazo 12 meses → R$ 2.395,08; investido R$ 2.200,00; juros R$ 195,08.
2. Taxa 0 → R$ 2.200,00. Prazo 1 "anos" → igual a 12 meses.
3. Campo vazio ou prazo 0 → mensagem no campo e nada é calculado.
4. O slider muda o gráfico e os números na hora; o aviso educativo fica sempre visível.
5. Em `/simuladores`, a simulação aparece na lista e reabre ao tocar.

Commit sugerido: `feat: simulador de juros compostos e tela de simuladores (RF03)`.

---

## Passo 5 — T15 Fatura do cartão (Essencial)

Ler antes: PRD 2.8.

Arquivos:
- Criar: `src/pages/jovem/FaturaCartao.tsx`.
- Modificar: `src/app/rotas.tsx`.

Tarefas:

- [ ] 5.1 Tela T15 com React Hook Form (`zodResolver(esquemaFatura)`):
  - Valores iniciais: `valorFatura: null`, `pagamentoMinimo: null`, `taxaRotativo: ''`, `taxaParcelamento: ''`, `parcelas: 12`. Placeholders de exemplo nas taxas ("Ex.: 15,00").
  - Campos do PRD 2.8; Número de parcelas como `Select` de 2 a 24. Texto de ajuda: "Use valores de exemplo. O app nunca pede dados do seu cartão."
  - Botões Simular (submit) e Limpar.
  - Ao simular: `simularFatura(paraEntradaFatura(valores))` e salvar a simulação (`tipoSimulacao: 'cartao_credito'`, `resultadoFinal: resultado.pagandoMinimo.totalPago`). O caso "mínimo maior ou igual à fatura" já é barrado pelo esquema, com a mensagem no campo do mínimo.
  - Resultado:
    - dois cards lado a lado (grade de 2 colunas): "Pagando o total" (total pago e "Juros: R$ 0,00") e "Pagando só o mínimo" (total pago e total de juros);
    - destaque: "Pagar só o mínimo custa R$ X a mais." com `formatarMoeda(resultado.custoExtra)`;
    - se `tetoAplicado`: aviso com ícone `Scale` e o texto "Teto legal aplicado: os juros foram limitados a 100% do saldo que foi para o rotativo (Lei nº 14.690/2023). A taxa do parcelamento caiu de {taxa informada} para {formatarPercentual(taxaParcelamentoEfetiva × 100)} ao mês.";
    - gráfico de barras empilhadas (Recharts) com os dois cenários, cada barra dividida em "Valor da fatura" e "Juros", com legenda e o valor escrito em cada parte (não só a cor);
    - tabela mês a mês (`Table`): Mês, Situação, Pagamento, Juros do mês e Saldo devedor, valores com `formatarMoeda` e `tabular-nums`;
    - nota: "Os valores são arredondados só na exibição; a soma das parcelas exibidas pode diferir do total em alguns centavos."
  - Aviso fixo: `<AvisoEducativo texto={AVISO_FATURA} />`.
  - Reabrir pela T13: igual ao 4.5.

- [ ] 5.2 Rota `/simuladores/cartao-de-credito` com `lazy`, como no 4.7.

Conferir: `npm run test`, `npm run lint`, `npm run build`; critérios de aceite de T15 (PRD 2.8).

O que o usuário testa (`/simuladores/cartao-de-credito`):
1. Fatura R$ 1.000,00, mínimo R$ 150,00, rotativo 15,00, parcelamento 9,00, 12 parcelas → juros do rotativo R$ 127,50; 12 parcelas de R$ 136,51; total R$ 1.788,10; juros R$ 788,10; sem aviso de teto.
2. Parcelamento 12,00 e 24 parcelas → aviso de teto com "5,00% ao mês"; parcelas de R$ 70,83; total R$ 1.850,00.
3. Mínimo R$ 1.000,00 → mensagem do rotativo no campo e nada calculado.
4. A tabela começa no mês 0 e termina com saldo R$ 0,00; o aviso educativo fica sempre visível.

Commit sugerido: `feat: simulador de fatura do cartão com teto legal (RF04, RN05)`.

---

## Passo 6 — Sessão simulada, T01 a T04, termos e regras de acesso (Essencial)

Ler antes: PRD 2.1, 3, 4.1 a 4.4; decisão 7 da 7.5.

Arquivos:
- Criar: `src/dados/demo/termos.ts`, `src/dados/repositorios/local/sessao.ts`, `src/dados/repositorios/local/testes.ts`, `src/hooks/useSessao.tsx`, `src/hooks/dados/useTestes.ts`, `src/app/guardas.tsx`, `src/components/ModalTermo.tsx`, `src/pages/publico/BoasVindas.tsx`, `src/pages/publico/Cadastro.tsx`, `src/pages/publico/Entrar.tsx`, `src/pages/publico/EsqueciSenha.tsx`, `src/pages/publico/esquemasAcesso.ts`, `src/pages/publico/esquemasAcesso.test.ts`.
- Modificar: `contratos.ts` (acrescentar `RepositorioSessao`, `DadosCadastro` e, de `RepositorioTestes`, só `meusTestes` por enquanto), `local/index.ts`, `local/comum.ts`, `src/main.tsx`, `src/app/rotas.tsx`, `src/layouts/LayoutAdmin.tsx`.

Tarefas:

- [ ] 6.1 Sessão obrigatória no repositório local. Em `local/comum.ts`, trocar `usuarioDaSessao` (sem o jovem de demonstração como reserva) e acrescentar o gerador de pseudônimo local:

```ts
export function usuarioDaSessao(): string {
  const id = lerAparelho().sessaoUsuarioId;
  if (!id) throw new Error('Sua sessão expirou. Entre de novo.');
  return id;
}

/** Pseudônimo local: "P-" + 4 caracteres hexadecimais, sem repetir (PRD 2.1). */
export function gerarPseudonimoLocal(existentes: string[]): string {
  for (;;) {
    const candidato = `P-${Math.floor(Math.random() * 0x10000).toString(16).toUpperCase().padStart(4, '0')}`;
    if (!existentes.includes(candidato)) return candidato;
  }
}
```

- [ ] 6.2 Repositório de sessão local (`src/dados/repositorios/local/sessao.ts`). A senha não é guardada nem conferida nesta etapa (decisão 7):

```ts
import { atualizarAparelho, assinarAparelho, lerAparelho } from '@/dados/aparelho';
import { alterarBanco, carregarBanco } from '@/dados/bancoLocal';
import { ID_ADMIN, ID_ALEX } from '@/dados/demo/usuarios';
import { agora } from '@/lib/relogio';
import type { RepositorioSessao } from '../contratos';
import { gerarPseudonimoLocal, responder } from './comum';

export const sessaoLocal: RepositorioSessao = {
  async sessaoAtual() {
    const id = lerAparelho().sessaoUsuarioId;
    const usuario = id ? carregarBanco().usuarios.find((u) => u.id === id) : undefined;
    return responder(usuario ? { usuarioId: usuario.id, papel: usuario.papel, nome: usuario.nome } : null);
  },
  observar: (aoMudar) => assinarAparelho(aoMudar),
  async cadastrar({ nome, email, tcleVersao }) {
    const emailNormalizado = email.trim().toLowerCase();
    const instante = agora().toISOString();
    alterarBanco((banco) => {
      if (banco.usuarios.some((u) => u.email.toLowerCase() === emailNormalizado)) throw new Error('Já existe uma conta com este e-mail');
      const id = crypto.randomUUID();
      banco.usuarios.push({
        id, nome: nome.trim(), email: emailNormalizado, papel: 'jovem', xpTotal: 0, diasStreak: 0, ultimoDiaUso: null,
        ultimaAtividadeEm: null, receberLembretes: true, tcleVersao, tcleAceitoEm: instante, privacidadeAceitaEm: instante,
        maioridadeDeclaradaEm: instante, criadoEm: instante,
      });
      banco.pseudonimos[id] = gerarPseudonimoLocal(Object.values(banco.pseudonimos));
      atualizarAparelho({ sessaoUsuarioId: id });
    });
    await responder(null);
  },
  async entrar(email) {
    const usuario = carregarBanco().usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!usuario) throw new Error('E-mail ou senha incorretos');
    atualizarAparelho({ sessaoUsuarioId: usuario.id });
    await responder(null);
  },
  async entrarDemonstracao(papel) {
    atualizarAparelho({ sessaoUsuarioId: papel === 'admin' ? ID_ADMIN : ID_ALEX });
    await responder(null);
  },
  async sair() {
    atualizarAparelho({ sessaoUsuarioId: null });
    await responder(null);
  },
  async pedirNovaSenha() {
    await responder(null); // confirmação simulada (PRD T04)
  },
  async definirNovaSenha() {
    throw new Error('Disponível só com a base de dados');
  },
};
```

- [ ] 6.3 Testes do jovem, primeira parte (`src/dados/repositorios/local/testes.ts`), para a regra de acesso do pré-teste:

```ts
import { carregarBanco } from '@/dados/bancoLocal';
import type { ResumoTeste } from '@/dados/tipos';
import type { RepositorioTestes } from '../contratos';
import { responder, usuarioDaSessao } from './comum';

export function resumosDoUsuario(usuarioId: string): ResumoTeste[] {
  const banco = carregarBanco();
  const pseudonimo = banco.pseudonimos[usuarioId];
  return banco.testes
    .filter((t) => t.pseudonimo === pseudonimo)
    .map((t) => ({
      tipoTeste: t.tipoTeste, forma: t.forma, versao: t.versao, iniciadoEm: t.iniciadoEm, concluidoEm: t.concluidoEm,
      pontuacaoTotal: t.pontuacaoTotal, respondidas: banco.respostasTeste.filter((r) => r.testeId === t.id).length,
    }));
}

export const testesLocal: Pick<RepositorioTestes, 'meusTestes'> = {
  meusTestes: () => responder(resumosDoUsuario(usuarioDaSessao())),
};
```

`src/hooks/dados/useTestes.ts`: `useMeusTestes()` (consulta `chaves.testes`) e `usePreTesteConcluido()`, que devolve `{ carregando, concluido }` com `concluido = testes.some((t) => t.tipoTeste === 'pre' && t.concluidoEm !== null)`.

- [ ] 6.4 Contexto da sessão (`src/hooks/useSessao.tsx`) e provedor no `main.tsx` (por dentro do `QueryClientProvider`, por fora do `RouterProvider`):

```tsx
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { repositorios } from '@/dados/repositorios';
import type { Sessao } from '@/dados/tipos';
import { chaves } from './dados/chaves';

const ContextoSessao = createContext<{ sessao: Sessao | null; carregando: boolean } | null>(null);

export function ProvedorSessao({ children }: { children: ReactNode }) {
  const clienteConsultas = useQueryClient();
  const consulta = useQuery({ queryKey: chaves.sessao, queryFn: () => repositorios.sessao.sessaoAtual(), staleTime: Infinity });
  useEffect(() => repositorios.sessao.observar(() => void clienteConsultas.invalidateQueries()), [clienteConsultas]);
  return <ContextoSessao.Provider value={{ sessao: consulta.data ?? null, carregando: consulta.isPending }}>{children}</ContextoSessao.Provider>;
}

export function useSessao() {
  const contexto = useContext(ContextoSessao);
  if (!contexto) throw new Error('useSessao precisa do ProvedorSessao');
  return contexto;
}
```

- [ ] 6.5 Regras de acesso do PRD 4.4 (`src/app/guardas.tsx`):

```tsx
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { usePreTesteConcluido } from '@/hooks/dados/useTestes';
import { useSessao } from '@/hooks/useSessao';

function Carregando() {
  return <div className="mx-auto max-w-[430px] space-y-3 p-4"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-32" /></div>;
}

export function RotaVisitante() {
  const { sessao, carregando } = useSessao();
  if (carregando) return <Carregando />;
  if (sessao) return <Navigate to={sessao.papel === 'admin' ? '/admin' : '/inicio'} replace />;
  return <Outlet />;
}

export function RotaJovem() {
  const { sessao, carregando } = useSessao();
  const local = useLocation();
  const preTeste = usePreTesteConcluido(Boolean(sessao && sessao.papel === 'jovem'));
  if (carregando) return <Carregando />;
  if (!sessao) return <Navigate to="/entrar" state={{ de: local.pathname }} replace />;
  if (sessao.papel === 'admin') return <Navigate to="/admin" replace />;
  if (preTeste.carregando) return <Carregando />;
  // Regra 3: com o pré-teste pendente, toda a área do jovem leva a ele.
  if (!preTeste.concluido && local.pathname !== '/pre-teste') return <Navigate to="/pre-teste" replace />;
  return <Outlet />;
}

export function RotaAdmin() {
  const { sessao, carregando } = useSessao();
  const local = useLocation();
  const negado = Boolean(sessao && sessao.papel !== 'admin');
  useEffect(() => {
    if (negado) toast.error('Área restrita ao administrador');
  }, [negado]);
  if (carregando) return <Carregando />;
  if (!sessao) return <Navigate to="/entrar" state={{ de: local.pathname }} replace />;
  if (negado) return <Navigate to="/inicio" replace />;
  return <Outlet />;
}
```

`usePreTesteConcluido(habilitado: boolean)` usa `enabled: habilitado` na consulta.

- [ ] 6.6 Rotas com as regras. Em `rotas.tsx`: envolver o `LayoutPublico` com `RotaVisitante`; o `LayoutFoco` e o `LayoutJovem` com um único `RotaJovem`; e `/admin` com `RotaAdmin` (o `LayoutAdmin` passa a ser filho dele):

```tsx
{ element: <RotaVisitante />, children: [{ element: <LayoutPublico />, children: [/* /, /cadastro, /entrar, /esqueci-senha */] }] },
{ element: <RotaJovem />, children: [{ element: <LayoutFoco />, children: [/* rotas de foco */] }, { element: <LayoutJovem />, children: [/* rotas do jovem */] }] },
{ path: '/admin', element: <RotaAdmin />, children: [{ element: <LayoutAdmin />, children: [/* rotas do administrador */] }] },
```

Os comentários marcam as listas de rotas que já existem desde o passo 1; elas só mudam de lugar.

- [ ] 6.7 Esquemas de acesso, com teste primeiro (`src/pages/publico/esquemasAcesso.test.ts`):

```ts
import { describe, expect, it } from 'vitest';
import { esquemaCadastro, esquemaEntrar, oQueFalta } from './esquemasAcesso';

const valido = { nome: 'Ana Souza', email: 'ana@exemplo.test', senha: '12345678', confirmarSenha: '12345678', aceiteTcle: true, aceitePrivacidade: true, maioridade: true };

describe('cadastro e login (RF01, RNF06)', () => {
  it('aceita o cadastro completo', () => {
    expect(esquemaCadastro.safeParse(valido).success).toBe(true);
  });
  it('recusa e-mail inválido, senha curta, confirmação diferente e aceites desmarcados', () => {
    expect(esquemaCadastro.safeParse({ ...valido, email: 'ana@' }).success).toBe(false);
    expect(esquemaCadastro.safeParse({ ...valido, senha: '1234567', confirmarSenha: '1234567' }).success).toBe(false);
    expect(esquemaCadastro.safeParse({ ...valido, confirmarSenha: '87654321' }).success).toBe(false);
    expect(esquemaCadastro.safeParse({ ...valido, aceiteTcle: false }).success).toBe(false);
    expect(esquemaCadastro.safeParse({ ...valido, maioridade: false }).success).toBe(false);
  });
  it('diz o que falta, na ordem dos campos', () => {
    expect(oQueFalta({ ...valido, aceiteTcle: false })).toBe('Falta aceitar o TCLE');
    expect(oQueFalta({ ...valido, nome: '' })).toBe('Falta preencher o nome');
    expect(oQueFalta(valido)).toBeNull();
  });
  it('login exige e-mail válido e senha com 8 caracteres', () => {
    expect(esquemaEntrar.safeParse({ email: 'ana@exemplo.test', senha: '12345678' }).success).toBe(true);
    expect(esquemaEntrar.safeParse({ email: 'ana', senha: '12345678' }).success).toBe(false);
  });
});
```

Implementação (`src/pages/publico/esquemasAcesso.ts`):

```ts
import { z } from 'zod';

const email = z.string().trim().min(1, 'Informe o seu e-mail').pipe(z.email('Digite um e-mail válido'));

export const esquemaCadastro = z.object({
  nome: z.string().trim().min(2, 'Informe o seu nome').max(80, 'Use no máximo 80 caracteres'),
  email,
  senha: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres'),
  confirmarSenha: z.string(),
  aceiteTcle: z.literal(true, { error: 'Aceite o TCLE para continuar' }),
  aceitePrivacidade: z.literal(true, { error: 'Aceite a Política de Privacidade para continuar' }),
  maioridade: z.literal(true, { error: 'Confirme que você tem 18 anos ou mais' }),
}).refine((v) => v.senha === v.confirmarSenha, { path: ['confirmarSenha'], message: 'As senhas não são iguais' });
export type FormularioCadastro = z.input<typeof esquemaCadastro>;

export const esquemaEntrar = z.object({ email, senha: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres') });
export const esquemaEsqueciSenha = z.object({ email });

/** Texto curto abaixo do botão Criar conta (PRD T02). */
export function oQueFalta(v: Partial<Record<keyof FormularioCadastro, unknown>>): string | null {
  const passos: [boolean, string][] = [
    [String(v.nome ?? '').trim().length >= 2, 'preencher o nome'],
    [z.email().safeParse(String(v.email ?? '').trim()).success, 'informar um e-mail válido'],
    [String(v.senha ?? '').length >= 8, 'criar uma senha com pelo menos 8 caracteres'],
    [v.senha === v.confirmarSenha && String(v.confirmarSenha ?? '') !== '', 'confirmar a senha'],
    [v.aceiteTcle === true, 'aceitar o TCLE'],
    [v.aceitePrivacidade === true, 'aceitar a Política de Privacidade'],
    [v.maioridade === true, 'declarar que tem 18 anos ou mais'],
  ];
  const pendente = passos.find(([ok]) => !ok);
  return pendente ? `Falta ${pendente[1]}` : null;
}
```

- [ ] 6.8 Textos provisórios dos termos (`src/dados/demo/termos.ts`), marcados como provisórios e sem afirmar conformidade legal (o orientador criticou "total conformidade"):

```ts
import { TCLE_VERSAO } from './usuarios';

export const SELO_PROVISORIO = 'Texto provisório — será substituído pelo texto oficial aprovado pelo Comitê de Ética em Pesquisa (CEP)';
export interface Termo { titulo: string; versao: string; secoes: { titulo: string; texto: string }[] }

export const TCLE: Termo = {
  titulo: 'Termo de Consentimento Livre e Esclarecido (TCLE)',
  versao: TCLE_VERSAO,
  secoes: [
    { titulo: 'Objetivo da pesquisa', texto: 'Este app faz parte de um Trabalho de Conclusão de Curso de Engenharia de Software da Universidade São Judas Tadeu. A pesquisa quer medir o ganho de conhecimento em finanças pessoais de quem usa o app.' },
    { titulo: 'O que pedimos a você', texto: 'Usar o app e responder a dois testes curtos, de 3 perguntas cada: um antes das trilhas e outro depois de concluí-las.' },
    { titulo: 'Dados coletados', texto: 'Nome, e-mail, as respostas dos testes e dados de uso do app (lições lidas, respostas dos quizzes e simulações). Não pedimos dados bancários.' },
    { titulo: 'Como os dados são tratados', texto: 'As respostas dos testes ficam ligadas a um código (pseudônimo), separado do seu nome e do seu e-mail, e são analisadas só de forma agregada.' },
    { titulo: 'Participação voluntária', texto: 'Participar é voluntário. Você pode desistir a qualquer momento, sem nenhum prejuízo.' },
    { titulo: 'Riscos e benefícios', texto: 'O risco é mínimo, ligado ao tempo de uso e ao desconforto de responder a perguntas. O benefício é aprender sobre finanças pessoais.' },
    { titulo: 'Contato', texto: 'Pesquisadores e Comitê de Ética em Pesquisa: contatos a preencher no texto oficial.' },
  ],
};

export const POLITICA_PRIVACIDADE: Termo = {
  titulo: 'Política de Privacidade',
  versao: TCLE_VERSAO,
  secoes: [
    { titulo: 'Dados coletados', texto: 'Nome, e-mail, respostas dos testes e dados de uso do app.' },
    { titulo: 'Finalidade', texto: 'Fazer o app funcionar (progresso, XP, conquistas e ranking) e realizar a pesquisa do TCC.' },
    { titulo: 'Quem tem acesso', texto: 'Só a equipe da pesquisa, e as respostas dos testes só pelo pseudônimo. No ranking, os outros participantes veem apenas o seu primeiro nome, a inicial do sobrenome e o seu XP.' },
    { titulo: 'Por quanto tempo', texto: 'Prazo de guarda a definir no texto oficial.' },
    { titulo: 'Dados bancários', texto: 'O app nunca pede número de cartão, conta ou senha de banco.' },
  ],
};
```

`src/components/ModalTermo.tsx`: `Dialog` com o título, o selo provisório (`Badge` com variante de destaque), as seções com `h3` e parágrafos, rolagem (`ScrollArea` com altura máxima de 60vh) e, quando receber `aceitoEm`, a linha "Aceito em dd/mm/aaaa às HH:MM" (`formatarDataHora`). Fecha com o botão, com Esc e tocando fora; quem abre controla o estado (`open`/`onOpenChange`), então o formulário de cadastro não perde o que foi digitado.

- [ ] 6.9 T01 Boas-vindas (`/`): exatamente o PRD T01 (nome em texto, frase de propósito, três destaques com ícones `BookOpen`, `Calculator` e `Trophy`, botões Criar conta e Entrar como `Link`, e o rodapé).

- [ ] 6.10 T02 Cadastro (`/cadastro`), com `useForm` (`zodResolver(esquemaCadastro)`, `mode: 'onChange'`):
  - campos do PRD; senha com botão de mostrar e ocultar (`Eye` / `EyeOff`, com `aria-label` "Mostrar senha" e "Ocultar senha");
  - três `Checkbox` com `Label`; nos dois primeiros, um botão de texto "Ler o TCLE" e "Ler a política" que abre o `ModalTermo` (`type="button"`, para não enviar o formulário);
  - botão Criar conta com `disabled={!formState.isValid || enviando}` e, abaixo, `oQueFalta(watch())` quando houver;
  - ao enviar: `repositorios.sessao.cadastrar({ nome, email, senha, tcleVersao: TCLE.versao })`; erro "Já existe uma conta com este e-mail" vai para o campo de e-mail (`setError`); sucesso → `navigate('/pre-teste')` (a sessão já foi aberta pelo repositório; o `ProvedorSessao` atualiza sozinho).

- [ ] 6.11 T03 Login (`/entrar`): campos com `esquemaEntrar`; erro do repositório num `Alert`/texto acima do botão; links "Esqueci minha senha" e "Criar conta"; bloco "Atalhos de demonstração (dados fictícios)" com os botões Entrar como jovem e Entrar como administrador (`repositorios.sessao.entrarDemonstracao`). Depois de entrar, navegar para `location.state?.de` quando existir; senão, para `/` (a `RotaVisitante` manda cada papel para a sua área, e a `RotaJovem` aplica o pré-teste).

- [ ] 6.12 T04 Esqueci minha senha (`/esqueci-senha`): campo e-mail com `esquemaEsqueciSenha`; ao enviar, `pedirNovaSenha(email)` e trocar o formulário pela confirmação do PRD T04, com o link "Voltar para o login".

- [ ] 6.13 Sair provisório: a rota `/perfil` passa a mostrar a `TelaProvisoria` com um botão Sair (`repositorios.sessao.sair()` e `navigate('/')`). No `LayoutAdmin`, ligar Sair (igual) e Voltar ao app (`entrarDemonstracao('jovem')` e `navigate('/inicio')`).

Conferir: `npm run test` (esquemas de acesso), `npm run lint`, `npm run build`; critérios de aceite de T01 a T04 e regras 1 a 5 do PRD 4.4.

O que o usuário testa:
1. Abrir `/inicio` sem sessão → vai para `/entrar`; depois de "Entrar como jovem", volta para `/inicio`.
2. Cadastro: o botão só habilita com tudo preenchido e os três aceites; o texto diz o que falta; os modais abrem sem apagar o formulário; depois de criar, cai em `/pre-teste` (ainda provisório) e não consegue abrir `/trilhas`.
3. Cadastrar de novo o mesmo e-mail → "Já existe uma conta com este e-mail".
4. Jovem abrindo `/admin` → volta para `/inicio` com o aviso "Área restrita ao administrador".
5. Esqueci minha senha → confirmação simulada, sem dizer se a conta existe.

Commit sugerido: `feat: cadastro com consentimento, login simulado e regras de acesso (RF01, RNF06)`.

---
## Passo 7 — T08 Trilhas, T09 Trilha e T10 Lição, com o conteúdo (Essencial)

Ler antes: PRD 2.4 (sem o modo offline), 5.7, 6.5; T08, T09 e T10.

Arquivos:
- Criar: `src/regras/progresso.ts`, `src/regras/progresso.test.ts`, `src/regras/motorAdaptativo.ts` (só `nivelAtualDaTrilha` neste passo), `src/dados/demo/licoes/orcamentoPessoal.ts`, `src/dados/demo/licoes/jurosCompostos.ts`, `src/dados/demo/licoes/cartaoDeCredito.ts`, `src/dados/demo/licoes/inflacaoEInvestimentos.ts`, `src/dados/demo/licoes/licoes.test.ts`, `src/dados/repositorios/local/progresso.ts`, `src/hooks/dados/useProgresso.ts`, `src/components/EtiquetaNivel.tsx`, `src/components/SeloStatus.tsx`, `src/pages/jovem/Trilhas.tsx`, `src/pages/jovem/Trilha.tsx`, `src/pages/jovem/Licao.tsx`.
- Modificar: `src/dados/demo/licoes/index.ts`, `contratos.ts` (acrescentar `RepositorioProgresso`, sem `sincronizarPendentes` por enquanto), `local/index.ts`, `local/comum.ts`, `src/app/rotas.tsx`.

Tarefas:

- [ ] 7.1 Nível atual da trilha (primeira função do motor; o resto vem no passo 8). `src/regras/motorAdaptativo.ts`:

```ts
import type { Nivel, RespostaQuiz } from '@/dados/tipos';

export const porData = (a: { respondidaEm: string }, b: { respondidaEm: string }) => a.respondidaEm.localeCompare(b.respondidaEm);

/** RN02: o nível atual é o da última resposta na trilha; toda trilha começa no Médio. */
export function nivelAtualDaTrilha(respostasDaTrilha: RespostaQuiz[]): Nivel {
  const ordenadas = [...respostasDaTrilha].sort(porData);
  return ordenadas.at(-1)?.nivelTrilhaApos ?? 'medio';
}
```

- [ ] 7.2 Teste das regras de progresso (`src/regras/progresso.test.ts`), usando os dados de demonstração:

```ts
import { describe, expect, it } from 'vitest';
import { criarDadosDemo } from '@/dados/demo';
import { LICOES, TRILHAS } from '@/dados/demo/trilhas';
import { ID_ALEX } from '@/dados/demo/usuarios';
import { calcularProgressoTrilha, continuarDeOndeParei, estadoDaLicao, trilhasConcluidas } from './progresso';

const banco = criarDadosDemo(new Date('2026-11-04T15:00:00Z'));
const progressos = banco.progressos.filter((p) => p.usuarioId === ID_ALEX);
const respostas = banco.respostasQuiz.filter((r) => r.usuarioId === ID_ALEX);
const licoesDe = (trilhaId: string) => LICOES.filter((l) => l.trilhaId === trilhaId);

describe('progresso nas trilhas (RF02)', () => {
  it('status de cada trilha do jovem principal', () => {
    const status = TRILHAS.map((t) => calcularProgressoTrilha(t.id, progressos, respostas, 5));
    expect(status.map((s) => [s.trilhaId, s.status, s.licoesConcluidas])).toEqual([
      ['orcamento-pessoal', 'concluida', 3],
      ['juros-compostos', 'em_andamento', 1],
      ['cartao-de-credito', 'nao_iniciada', 0],
      ['inflacao-e-investimentos', 'nao_iniciada', 0],
    ]);
    expect(status[0].nivelAtual).toBe('medio');
  });
  it('a lição seguinte só abre depois do quiz da anterior', () => {
    const [l1, l2, l3] = licoesDe('juros-compostos');
    expect(estadoDaLicao(l1, licoesDe('juros-compostos'), progressos)).toBe('concluida');
    expect(estadoDaLicao(l2, licoesDe('juros-compostos'), progressos)).toBe('disponivel');
    expect(estadoDaLicao(l3, licoesDe('juros-compostos'), progressos)).toBe('bloqueada');
    expect(estadoDaLicao(licoesDe('cartao-de-credito')[0], licoesDe('cartao-de-credito'), progressos)).toBe('disponivel');
  });
  it('leitura feita sem quiz fica como quiz pendente', () => {
    const comLeitura = [...progressos, { ...progressos[0], id: 'x', licaoId: 'juros-compostos-2', trilhaId: 'juros-compostos', quizConcluidoEm: null }];
    expect(estadoDaLicao(licoesDe('juros-compostos')[1], licoesDe('juros-compostos'), comLeitura)).toBe('quiz_pendente');
  });
  it('continuar de onde parei: Juros Compostos, lição 2, ler', () => {
    const c = continuarDeOndeParei(TRILHAS, LICOES, progressos, respostas);
    expect(c).toMatchObject({ tipo: 'continuar', acao: 'ler' });
    expect(c.tipo === 'continuar' && c.licao.id).toBe('juros-compostos-2');
  });
  it('conta as trilhas concluídas', () => {
    expect(trilhasConcluidas(progressos)).toBe(1);
  });
});
```

Rodar e ver falhar.

- [ ] 7.3 Implementar `src/regras/progresso.ts`:

```ts
import type { Licao, Progresso, ProgressoTrilha, RespostaQuiz, StatusTrilha, Trilha } from '@/dados/tipos';
import { nivelAtualDaTrilha, porData } from './motorAdaptativo';

export type EstadoLicao = 'concluida' | 'quiz_pendente' | 'disponivel' | 'bloqueada';

export function estadoDaLicao(licao: Licao, licoesDaTrilha: Licao[], progressos: Progresso[]): EstadoLicao {
  const daLicao = (id: string) => progressos.find((p) => p.licaoId === id);
  const atual = daLicao(licao.id);
  if (atual?.quizConcluidoEm) return 'concluida';
  if (atual?.leituraConcluidaEm) return 'quiz_pendente';
  if (licao.ordem === 1) return 'disponivel';
  const anterior = licoesDaTrilha.find((l) => l.ordem === licao.ordem - 1);
  return anterior && daLicao(anterior.id)?.quizConcluidoEm ? 'disponivel' : 'bloqueada';
}

export function calcularProgressoTrilha(trilhaId: string, progressos: Progresso[], respostas: RespostaQuiz[], janela: number): ProgressoTrilha {
  const daTrilha = progressos.filter((p) => p.trilhaId === trilhaId);
  const respostasDaTrilha = respostas.filter((r) => r.trilhaId === trilhaId).sort(porData);
  const licoesConcluidas = daTrilha.filter((p) => p.quizConcluidoEm).length;
  const iniciada = daTrilha.some((p) => p.leituraConcluidaEm || p.quizConcluidoEm);
  const status: StatusTrilha = licoesConcluidas >= 3 ? 'concluida' : iniciada ? 'em_andamento' : 'nao_iniciada';
  const ultimas = respostasDaTrilha.slice(-janela);
  const datas = [...daTrilha.flatMap((p) => [p.leituraConcluidaEm, p.quizConcluidoEm]), ...respostasDaTrilha.map((r) => r.respondidaEm)]
    .filter((d): d is string => Boolean(d))
    .sort();
  return {
    trilhaId,
    licoesConcluidas,
    status,
    nivelAtual: nivelAtualDaTrilha(respostasDaTrilha),
    taxaAcertos: ultimas.length ? (ultimas.filter((r) => r.acertou).length / ultimas.length) * 100 : null,
    dataUltimoAcesso: datas.at(-1) ?? null,
  };
}

/** Quantas trilhas têm os 3 quizzes concluídos. */
export function trilhasConcluidas(progressos: Progresso[]): number {
  const concluidosPorTrilha = new Map<string, number>();
  for (const p of progressos) if (p.quizConcluidoEm) concluidosPorTrilha.set(p.trilhaId, (concluidosPorTrilha.get(p.trilhaId) ?? 0) + 1);
  return [...concluidosPorTrilha.values()].filter((n) => n >= 3).length;
}

export type Continuacao =
  | { tipo: 'continuar'; trilha: Trilha; licao: Licao; acao: 'ler' | 'quiz' }
  | { tipo: 'comecar'; trilha: Trilha; licao: Licao }
  | { tipo: 'todas_concluidas' };

/** Card "Continuar de onde parei" (PRD T07). */
export function continuarDeOndeParei(trilhas: Trilha[], licoes: Licao[], progressos: Progresso[], respostas: RespostaQuiz[]): Continuacao {
  const comProgresso = trilhas.map((t) => ({ trilha: t, p: calcularProgressoTrilha(t.id, progressos, respostas, 5) }));
  const emAndamento = comProgresso
    .filter((x) => x.p.status === 'em_andamento')
    .sort((a, b) => (b.p.dataUltimoAcesso ?? '').localeCompare(a.p.dataUltimoAcesso ?? ''));
  if (emAndamento.length > 0) {
    const trilha = emAndamento[0].trilha;
    const daTrilha = licoes.filter((l) => l.trilhaId === trilha.id).sort((a, b) => a.ordem - b.ordem);
    const licao = daTrilha.find((l) => !progressos.find((p) => p.licaoId === l.id)?.quizConcluidoEm)!;
    const leu = Boolean(progressos.find((p) => p.licaoId === licao.id)?.leituraConcluidaEm);
    return { tipo: 'continuar', trilha, licao, acao: leu ? 'quiz' : 'ler' };
  }
  const naoIniciada = comProgresso.filter((x) => x.p.status === 'nao_iniciada').sort((a, b) => a.trilha.ordem - b.trilha.ordem)[0];
  if (naoIniciada) {
    const licao = licoes.find((l) => l.trilhaId === naoIniciada.trilha.id && l.ordem === 1)!;
    return { tipo: 'comecar', trilha: naoIniciada.trilha, licao };
  }
  return { tipo: 'todas_concluidas' };
}
```

Rodar e ver passar.

- [ ] 7.4 Conteúdo das 12 lições (PRD 6.5). Um arquivo por trilha, cada um exportando `conteudo: Record<string, BlocoConteudo[]>` e `tempos: Record<string, number>`; `src/dados/demo/licoes/index.ts` junta os quatro em `CONTEUDO` e `TEMPO_DE_LEITURA`. Regras para cada lição:
  - de 3 a 5 blocos `texto` curtos (até 3 frases cada), linguagem simples e com "você";
  - todo termo financeiro explicado na primeira vez (aporte, montante, CDI, liquidez, rotativo, CET, IPCA, ativo, fundo);
  - exatamente 1 bloco `exemplo`, com os valores da coluna "Exemplo prático" do PRD 6.5 (contas conferidas);
  - exatamente 1 bloco `resumo`, com 3 ou 4 itens;
  - tempo de leitura de 3 a 5 minutos;
  - nenhum exemplo usa os cenários e números das perguntas do teste diagnóstico (PRD 2.2);
  - textos sem marcação de gênero quando possível.

Modelo de uma lição completa (`jurosCompostos.ts`), para as outras seguirem o mesmo padrão:

```ts
import type { BlocoConteudo } from '@/dados/tipos';

export const conteudo: Record<string, BlocoConteudo[]> = {
  'juros-compostos-1': [
    { tipo: 'texto', texto: 'Juros são o "aluguel" do dinheiro: quem empresta recebe, quem pega emprestado paga. Quando você guarda dinheiro numa aplicação, é você quem recebe os juros.' },
    { tipo: 'texto', texto: 'Nos juros simples, a taxa incide sempre sobre o valor inicial. Nos juros compostos, ela incide sobre o saldo de cada mês, que já inclui os juros dos meses anteriores: são os "juros sobre juros".' },
    { tipo: 'texto', texto: 'No começo a diferença é pequena, mas ela cresce com o tempo. Por isso os juros compostos ajudam quem investe e pesam para quem está devendo.' },
    { tipo: 'exemplo', titulo: 'R$ 1.000,00 a 1% ao mês por 3 meses', linhas: [
      'Juros simples: R$ 10,00 por mês, e você termina com R$ 1.030,00.',
      'Juros compostos: R$ 1.010,00, depois R$ 1.020,10 e, no fim, R$ 1.030,30.',
      'A diferença ainda é de R$ 0,30, mas aumenta a cada mês.',
    ] },
    { tipo: 'resumo', itens: [
      'Juros compostos rendem sobre o saldo, não só sobre o valor inicial.',
      'A diferença para os juros simples cresce com o tempo.',
      'Juros sobre juros ajudam quem investe e pesam para quem deve.',
    ] },
  ],
  // 'juros-compostos-2' e 'juros-compostos-3' no mesmo formato, com os pontos e exemplos do PRD 6.5
};

export const tempos: Record<string, number> = { 'juros-compostos-1': 4, 'juros-compostos-2': 4, 'juros-compostos-3': 5 };
```

O comentário no modelo marca o que ainda vai ser escrito nesta mesma tarefa; no arquivo final, as três lições existem e o comentário sai. Pedir ao usuário que o grupo revise os textos (correção financeira) ao fim do passo.

- [ ] 7.5 Teste da estrutura do conteúdo (`src/dados/demo/licoes/licoes.test.ts`):

```ts
import { describe, expect, it } from 'vitest';
import { LICOES } from '../trilhas';

describe('conteúdo das lições (PRD 2.4 e 6.5)', () => {
  it.each(LICOES.map((l) => [l.id, l] as const))('%s tem texto, 1 exemplo, 1 resumo e tempo de 3 a 5 min', (_id, licao) => {
    const tipos = licao.conteudo.map((b) => b.tipo);
    expect(tipos.filter((t) => t === 'texto').length).toBeGreaterThanOrEqual(3);
    expect(tipos.filter((t) => t === 'exemplo')).toHaveLength(1);
    expect(tipos.filter((t) => t === 'resumo')).toHaveLength(1);
    const resumo = licao.conteudo.find((b) => b.tipo === 'resumo');
    expect(resumo && resumo.tipo === 'resumo' && resumo.itens.length).toBeGreaterThanOrEqual(3);
    expect(licao.tempoLeituraMin).toBeGreaterThanOrEqual(3);
    expect(licao.tempoLeituraMin).toBeLessThanOrEqual(5);
  });
});
```

- [ ] 7.6 Atividade e progresso no modo local. Em `local/comum.ts`:

```ts
import type { BancoDados } from '@/dados/bancoLocal';
import type { ChaveParametro } from '@/dados/tipos';

export const estaOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine);

/** Lição ou quiz concluído: atualiza a última atividade (o passo 8 acrescenta a sequência). */
export function registrarAtividade(banco: BancoDados, usuarioId: string, instante: Date): void {
  const usuario = banco.usuarios.find((u) => u.id === usuarioId)!;
  usuario.ultimaAtividadeEm = instante.toISOString();
}

/** Valor mais recente de cada parâmetro (o histórico só acrescenta linhas). */
export function parametrosAtuaisLocal(banco: BancoDados): Record<ChaveParametro, number> {
  const atuais = {} as Record<ChaveParametro, number>;
  const ordenados = [...banco.parametros].sort((a, b) => a.alteradoEm.localeCompare(b.alteradoEm));
  for (const p of ordenados) atuais[p.chave] = p.valor;
  return atuais;
}
```

`src/dados/repositorios/local/progresso.ts`:

```ts
import { alterarBanco, carregarBanco } from '@/dados/bancoLocal';
import { LICOES } from '@/dados/demo/trilhas';
import { agora } from '@/lib/relogio';
import { estadoDaLicao } from '@/regras/progresso';
import type { RepositorioProgresso } from '../contratos';
import { estaOnline, registrarAtividade, responder, usuarioDaSessao } from './comum';

export const progressoLocal: Omit<RepositorioProgresso, 'sincronizarPendentes'> = {
  meusProgressos: () => responder(carregarBanco().progressos.filter((p) => p.usuarioId === usuarioDaSessao())),
  minhasRespostas: () => responder(carregarBanco().respostasQuiz.filter((r) => r.usuarioId === usuarioDaSessao())),
  async concluirLeitura(licaoId) {
    const usuarioId = usuarioDaSessao();
    alterarBanco((banco) => {
      const licao = LICOES.find((l) => l.id === licaoId);
      if (!licao) throw new Error('Lição não encontrada');
      const meus = banco.progressos.filter((p) => p.usuarioId === usuarioId);
      if (estadoDaLicao(licao, LICOES.filter((l) => l.trilhaId === licao.trilhaId), meus) === 'bloqueada') {
        throw new Error('Conclua a lição anterior para desbloquear');
      }
      if (meus.some((p) => p.licaoId === licaoId)) return; // só a primeira conclusão conta
      const instante = agora();
      banco.progressos.push({
        id: crypto.randomUUID(), usuarioId, trilhaId: licao.trilhaId, licaoId, leituraConcluidaEm: instante.toISOString(),
        quizConcluidoEm: null, acertos: 0, xpGanho: 0, sincronizadoOffline: estaOnline(),
      });
      registrarAtividade(banco, usuarioId, instante);
    });
    await responder(null);
  },
};
```

`src/hooks/dados/useProgresso.ts`: `useProgressos()`, `useMinhasRespostas()`, `useConcluirLeitura()` (mutação; ao terminar, invalida `progresso`, `respostas` e `usuario`) e `useProgressoDasTrilhas()`, que junta `useTrilhas`, `useProgressos` e `useMinhasRespostas` e devolve um `Map<string, ProgressoTrilha>` com `calcularProgressoTrilha(..., 5)`.

- [ ] 7.7 Componentes de apoio:
  - `EtiquetaNivel`: ícone `SignalLow`, `SignalMedium` ou `SignalHigh` + texto "Fácil", "Médio" ou "Difícil", com borda e cor neutras (nunca verde ou vermelho). Exporta `ROTULO_NIVEL`.
  - `SeloStatus`: ícone + texto para "Não iniciada" (`Circle`), "Em andamento" (`CircleDashed`) e "Concluída" (`CircleCheck`). Exporta `ROTULO_STATUS`.

- [ ] 7.8 T08 Trilhas (`/trilhas`): 4 cards com `Link` para `/trilhas/<slug>`: título, descrição, `SeloStatus`, "3 lições", `Progress` (`value = licoesConcluidas / 3 × 100`, com `aria-label` "Progresso: 1 de 3 lições") e, se a trilha não for "não iniciada", `EtiquetaNivel` com o nível atual. Skeleton enquanto carrega.

- [ ] 7.9 T09 Trilha (`/trilhas/:trilha`): cabeçalho (título, descrição, status, progresso e "Nível atual" com `EtiquetaNivel`); lista das 3 lições, cada uma com número, título, "N min de leitura" e o estado com ícone e texto (Concluída, Quiz pendente, Disponível, Bloqueada com `Lock`). Lição liberada é um `Link` para `/trilhas/<slug>/licoes/<ordem>`; lição bloqueada é um botão com `aria-disabled="true"` que mostra o toast "Conclua a lição anterior para desbloquear". Slug inexistente mostra a página não encontrada. O botão Baixar trilha entra no passo 11.

- [ ] 7.10 T10 Lição (`/trilhas/:trilha/licoes/:licao`, modo foco):
  - cabeçalho com voltar (para a trilha), nome da trilha, "Lição N de 3" e "N min de leitura";
  - lição bloqueada aberta pela URL: `Navigate` para a trilha e toast de bloqueio;
  - blocos: `texto` como parágrafo; `exemplo` num card destacado com título e linhas (`tabular-nums`); `resumo` com o título "Resumo" e lista;
  - rodapé fixo: se o quiz ainda não foi feito, botão "Concluir leitura e fazer o quiz" (`useConcluirLeitura` e, ao terminar, `navigate` para `.../quiz`); se já foi feito, "Lição concluída" e os botões Próxima lição (quando houver e estiver liberada) e Voltar à trilha;
  - ao abrir, o foco vai para o título da lição (`h1` com `tabIndex={-1}` e `ref.focus()`).

- [ ] 7.11 Rotas: trocar as telas provisórias de `/trilhas`, `/trilhas/:trilha` e `/trilhas/:trilha/licoes/:licao`.

Conferir: `npm run test` (progresso e conteúdo), `npm run lint`, `npm run build`; critérios de T08 a T10 (sem o modo offline).

O que o usuário testa (entrar como jovem):
1. `/trilhas`: Orçamento Pessoal concluída (3 de 3), Juros Compostos em andamento (1 de 3), as outras duas não iniciadas.
2. Juros Compostos: lição 1 concluída, 2 disponível, 3 bloqueada; tocar na 3 mostra o aviso.
3. Lição 2: blocos de texto, exemplo em reais, resumo e tempo; "Concluir leitura e fazer o quiz" leva à tela provisória do quiz.
4. Ler as 12 lições e revisar a correção financeira dos textos com o grupo.

Commit sugerido: `feat: trilhas, lições e conteúdo das 4 trilhas (RF02)`.

---

## Passo 8 — Regras do motor, do XP e da sequência, com testes (Essencial)

Ler antes: PRD 2.5 (Motor adaptativo e XP), 2.10 (Sequência e Lembretes), 6.4, 6.6, 6.9 e 7.3; instruções do projeto (Motor adaptativo; XP, sequência e lembrete).

Arquivos:
- Criar: `src/dados/demo/estruturaQuestoes.ts`, `src/regras/motorAdaptativo.test.ts`, `src/regras/gamificacao.ts`, `src/regras/gamificacao.test.ts`, `src/regras/sequencia.ts`, `src/regras/sequencia.test.ts`.
- Modificar: `src/regras/motorAdaptativo.ts`, `src/dados/repositorios/local/comum.ts`.

Tarefas:

- [ ] 8.1 Estrutura do banco de questões (PRD 6.6), usada pelos testes do motor e conferida contra as questões do passo 9:

```ts
// src/dados/demo/estruturaQuestoes.ts
import type { Nivel } from '@/dados/tipos';
import { LICOES } from './trilhas';

/** 4 questões por lição — lição 1: 1 Fácil e 3 Médio; lição 2: 1 Fácil, 2 Médio e 1 Difícil; lição 3: 1 Fácil, 1 Médio e 2 Difícil. */
export const SUFIXOS_POR_LICAO: Record<1 | 2 | 3, [sufixo: string, nivel: Nivel][]> = {
  1: [['f1', 'facil'], ['m1', 'medio'], ['m2', 'medio'], ['m3', 'medio']],
  2: [['f1', 'facil'], ['m1', 'medio'], ['m2', 'medio'], ['d1', 'dificil']],
  3: [['f1', 'facil'], ['m1', 'medio'], ['d1', 'dificil'], ['d2', 'dificil']],
};

export interface ItemEstrutura { id: string; quizId: string; trilhaId: string; licaoOrdem: number; nivel: Nivel }

export const ESTRUTURA_QUESTOES: ItemEstrutura[] = LICOES.flatMap((licao) =>
  SUFIXOS_POR_LICAO[licao.ordem].map(([sufixo, nivel]) => ({
    id: `${licao.id}-${sufixo}`, quizId: `${licao.id}-quiz`, trilhaId: licao.trilhaId, licaoOrdem: licao.ordem, nivel,
  })),
);
```

- [ ] 8.2 Testes do motor (`src/regras/motorAdaptativo.test.ts`):

```ts
import { describe, expect, it } from 'vitest';
import { criarDadosDemo } from '@/dados/demo';
import { ESTRUTURA_QUESTOES } from '@/dados/demo/estruturaQuestoes';
import type { Nivel } from '@/dados/tipos';
import { xpPorResposta } from './gamificacao';
import {
  grupoPreferido, nivelAtualDaTrilha, PARAMETROS_MOTOR_PADRAO, porData, proximoNivel, selecionarProximaQuestao,
  type CandidataQuestao,
} from './motorAdaptativo';

const P = PARAMETROS_MOTOR_PADRAO;
const C = true;
const E = false;
const candidatas = (trilhaId: string): CandidataQuestao[] =>
  ESTRUTURA_QUESTOES.filter((q) => q.trilhaId === trilhaId).map((q) => ({ id: q.id, licaoOrdem: q.licaoOrdem, nivel: q.nivel, ativa: true }));

/** Aplica o motor a uma sequência de acertos, começando no Médio. */
function simular(acertos: boolean[], p = P): Nivel {
  let nivel: Nivel = 'medio';
  acertos.forEach((_, k) => { nivel = proximoNivel(nivel, acertos.slice(0, k + 1), p); });
  return nivel;
}

describe('motor adaptativo (RN02)', () => {
  it('RN02: começa no Médio e não ajusta antes de a janela encher', () => {
    expect(nivelAtualDaTrilha([])).toBe('medio');
    expect(simular([C, C, C, C])).toBe('medio');
  });
  it('RN02: 4 ou 5 acertos em 5 sobem; 3 mantêm; 0 a 2 descem', () => {
    expect(proximoNivel('medio', [C, C, C, C, E], P)).toBe('dificil');
    expect(proximoNivel('medio', [C, C, C, E, E], P)).toBe('medio');
    expect(proximoNivel('medio', [C, C, E, E, E], P)).toBe('facil');
  });
  it('RN02: não passa de Difícil nem de Fácil', () => {
    expect(proximoNivel('dificil', [C, C, C, C, C], P)).toBe('dificil');
    expect(proximoNivel('facil', [E, E, E, E, E], P)).toBe('facil');
  });
  it('RN02: a janela é deslizante e não zera quando o nível muda', () => {
    expect(proximoNivel('dificil', [E, C, C, C, C, E], P)).toBe('dificil'); // últimas 5: C C C C E = 4
    expect(proximoNivel('medio', [C, C, C, C, C, E, E, E], P)).toBe('facil'); // últimas 5: C C E E E = 2
  });
  it('RN02: janela e limiares vêm dos parâmetros (RF11)', () => {
    const outros = { janela: 3, limiarSubida: 70, limiarDescida: 30 };
    expect(proximoNivel('medio', [C, C, E], outros)).toBe('medio'); // 66,7%
    expect(proximoNivel('medio', [C, C, C], outros)).toBe('dificil');
    expect(proximoNivel('medio', [C, E, E], outros)).toBe('medio'); // 33,3%
    expect(proximoNivel('medio', [E, E, E], outros)).toBe('facil');
  });
  it('RN02: perfis sintéticos determinísticos — 30% desce, 60% mantém, 90% sobe', () => {
    const repetir = (padrao: boolean[], vezes: number) => Array.from({ length: vezes }, () => padrao).flat();
    expect(simular(repetir([C, E, E, C, E, E, C, E, E, E], 3))).toBe('facil');
    expect(simular(repetir([C, C, C, E, E], 6))).toBe('medio');
    expect(simular(repetir([C, C, C, C, C, C, C, C, C, E], 3))).toBe('dificil');
  });
});

describe('seleção da próxima questão (RN02, decisões 2 e 9)', () => {
  const daTrilha = candidatas('juros-compostos');
  const base = { questoesDaTrilha: daTrilha, respondidasPeloJovem: [], respondidasNesteQuiz: [] };

  it('prefere o nível atual e, nele, a lição atual', () => {
    expect(grupoPreferido({ ...base, nivelAtual: 'medio', licaoAtualOrdem: 2 })).toEqual(['juros-compostos-2-m1', 'juros-compostos-2-m2']);
  });
  it('nunca usa questão de lição seguinte', () => {
    expect(grupoPreferido({ ...base, nivelAtual: 'dificil', licaoAtualOrdem: 1 })).toEqual(['juros-compostos-1-m1', 'juros-compostos-1-m2', 'juros-compostos-1-m3']);
  });
  it('sem candidatas no nível atual, vai ao mais próximo; no empate, ao mais fácil', () => {
    const medioDaLicao1 = ['juros-compostos-1-m1', 'juros-compostos-1-m2', 'juros-compostos-1-m3'];
    const respondidas = medioDaLicao1.map((id, i) => ({ questaoId: id, respondidaEm: `2026-01-01T00:00:0${i}.000Z` }));
    expect(grupoPreferido({ ...base, respondidasPeloJovem: respondidas, nivelAtual: 'medio', licaoAtualOrdem: 1 })).toEqual(['juros-compostos-1-f1']);
  });
  it('ignora questões inativas e já respondidas', () => {
    const comInativa = daTrilha.map((q) => (q.id === 'juros-compostos-2-m1' ? { ...q, ativa: false } : q));
    const respondida = [{ questaoId: 'juros-compostos-2-m2', respondidaEm: '2026-01-01T00:00:00.000Z' }];
    expect(grupoPreferido({ ...base, questoesDaTrilha: comInativa, respondidasPeloJovem: respondida, nivelAtual: 'medio', licaoAtualOrdem: 2 }))
      .toEqual(['juros-compostos-1-m1', 'juros-compostos-1-m2', 'juros-compostos-1-m3']);
  });
  it('caso extremo: repete a respondida há mais tempo, nunca uma deste quiz', () => {
    const daLicao1 = daTrilha.filter((q) => q.licaoOrdem === 1);
    const respondidas = daLicao1.map((q, i) => ({ questaoId: q.id, respondidaEm: `2026-01-0${i + 1}T00:00:00.000Z` }));
    expect(grupoPreferido({ ...base, respondidasPeloJovem: respondidas, nivelAtual: 'medio', licaoAtualOrdem: 1 })).toEqual([daLicao1[0].id]);
    expect(grupoPreferido({ ...base, respondidasPeloJovem: respondidas, respondidasNesteQuiz: [daLicao1[0].id], nivelAtual: 'medio', licaoAtualOrdem: 1 })).toEqual([daLicao1[1].id]);
  });
  it('o sorteio usa a fonte de aleatoriedade recebida', () => {
    expect(selecionarProximaQuestao({ ...base, nivelAtual: 'medio', licaoAtualOrdem: 2, aleatorio: () => 0 })).toBe('juros-compostos-2-m1');
    expect(selecionarProximaQuestao({ ...base, nivelAtual: 'medio', licaoAtualOrdem: 2, aleatorio: () => 0.99 })).toBe('juros-compostos-2-m2');
  });
});

describe('dados de demonstração reproduzidos pelo motor (PRD 6.4 e 6.9)', () => {
  const banco = criarDadosDemo(new Date('2026-11-04T15:00:00Z'));

  it.each(['orcamento-pessoal', 'juros-compostos'])('RN02: histórico do jovem principal em %s, escolha a escolha', (trilhaId) => {
    const respostas = banco.respostasQuiz.filter((r) => r.trilhaId === trilhaId).sort(porData);
    let nivel: Nivel = 'medio';
    respostas.forEach((r, k) => {
      const anteriores = respostas.slice(0, k);
      const licaoAtualOrdem = Number(r.quizId.match(/-(\d)-quiz$/)![1]);
      const grupo = grupoPreferido({
        nivelAtual: nivel, licaoAtualOrdem, questoesDaTrilha: candidatas(trilhaId),
        respondidasPeloJovem: anteriores.map((a) => ({ questaoId: a.questaoId, respondidaEm: a.respondidaEm })),
        respondidasNesteQuiz: anteriores.filter((a) => a.quizId === r.quizId).map((a) => a.questaoId),
      });
      expect(grupo).toContain(r.questaoId);
      nivel = proximoNivel(nivel, [...anteriores.map((a) => a.acertou), r.acertou], P);
      expect(nivel).toBe(r.nivelTrilhaApos);
    });
  });

  it('RN02 e RN03: roteiro — 3 acertos na lição 2 de Juros Compostos sobem para Difícil e dão +75 XP', () => {
    const respostas = banco.respostasQuiz.filter((r) => r.trilhaId === 'juros-compostos').sort(porData);
    const historico = respostas.map((r) => ({ questaoId: r.questaoId, respondidaEm: r.respondidaEm }));
    const acertos = respostas.map((r) => r.acertou);
    const noQuiz: string[] = [];
    const niveis: Nivel[] = [];
    let nivel = nivelAtualDaTrilha(respostas);
    let xp = 0;
    for (let k = 0; k < 3; k++) {
      const [id] = grupoPreferido({ nivelAtual: nivel, licaoAtualOrdem: 2, questoesDaTrilha: candidatas('juros-compostos'), respondidasPeloJovem: historico, respondidasNesteQuiz: noQuiz });
      const escolhida = candidatas('juros-compostos').find((q) => q.id === id)!;
      niveis.push(escolhida.nivel);
      xp += xpPorResposta(escolhida.nivel, true);
      acertos.push(true);
      historico.push({ questaoId: id, respondidaEm: `2099-01-01T00:00:0${k}.000Z` });
      noQuiz.push(id);
      nivel = proximoNivel(nivel, acertos, P);
      if (k === 1) expect(nivel).toBe('dificil'); // sobe depois da 2ª resposta (4 de 5)
    }
    expect(niveis).toEqual(['medio', 'medio', 'dificil']);
    expect(xp).toBe(75);
  });
});
```

Rodar e ver falhar.

- [ ] 8.3 Completar `src/regras/motorAdaptativo.ts` (manter `porData` e `nivelAtualDaTrilha` do passo 7):

```ts
export const NIVEIS: Nivel[] = ['facil', 'medio', 'dificil'];

export interface ParametrosMotor { janela: number; limiarSubida: number; limiarDescida: number } // limiares de 0 a 100
export const PARAMETROS_MOTOR_PADRAO: ParametrosMotor = { janela: 5, limiarSubida: 80, limiarDescida: 40 };

/**
 * RN02: nível depois de uma resposta. `acertosDaTrilha` em ordem cronológica, já com a resposta nova.
 * Janela deslizante sobre as últimas N respostas da trilha; com menos de N, o nível não muda.
 */
export function proximoNivel(nivelAtual: Nivel, acertosDaTrilha: boolean[], p: ParametrosMotor): Nivel {
  if (acertosDaTrilha.length < p.janela) return nivelAtual;
  const janela = acertosDaTrilha.slice(-p.janela);
  const taxa = (janela.filter(Boolean).length / p.janela) * 100;
  const i = NIVEIS.indexOf(nivelAtual);
  if (taxa >= p.limiarSubida) return NIVEIS[Math.min(i + 1, NIVEIS.length - 1)];
  if (taxa <= p.limiarDescida) return NIVEIS[Math.max(i - 1, 0)];
  return nivelAtual;
}

/** Ordem de busca do "nível mais próximo"; no empate, o mais fácil (decisão 2). */
export const ORDEM_DE_BUSCA: Record<Nivel, Nivel[]> = {
  facil: ['facil', 'medio', 'dificil'],
  medio: ['medio', 'facil', 'dificil'],
  dificil: ['dificil', 'medio', 'facil'],
};

export interface CandidataQuestao { id: string; licaoOrdem: number; nivel: Nivel; ativa: boolean }
export interface EntradaSelecao {
  nivelAtual: Nivel;
  licaoAtualOrdem: number;
  questoesDaTrilha: CandidataQuestao[];
  respondidasPeloJovem: { questaoId: string; respondidaEm: string }[]; // na trilha, em qualquer quiz
  respondidasNesteQuiz: string[];
}

/**
 * RN02 e decisão 9: grupo de onde a próxima questão é sorteada. Candidatas: ativas, da lição atual ou anteriores,
 * nunca respondidas. Preferência: nível atual e, nele, a lição atual; depois o nível mais próximo.
 * Caso extremo: a respondida há mais tempo, fora deste quiz.
 */
export function grupoPreferido(e: EntradaSelecao): string[] {
  const respondidas = new Set(e.respondidasPeloJovem.map((r) => r.questaoId));
  const permitidas = e.questoesDaTrilha.filter((q) => q.ativa && q.licaoOrdem <= e.licaoAtualOrdem && !e.respondidasNesteQuiz.includes(q.id));
  const candidatas = permitidas.filter((q) => !respondidas.has(q.id));
  for (const nivel of ORDEM_DE_BUSCA[e.nivelAtual]) {
    const doNivel = candidatas.filter((q) => q.nivel === nivel);
    if (doNivel.length === 0) continue;
    const daLicaoAtual = doNivel.filter((q) => q.licaoOrdem === e.licaoAtualOrdem);
    return (daLicaoAtual.length > 0 ? daLicaoAtual : doNivel).map((q) => q.id);
  }
  const ultimaVez = new Map<string, string>();
  for (const r of e.respondidasPeloJovem) {
    const anterior = ultimaVez.get(r.questaoId);
    if (!anterior || r.respondidaEm > anterior) ultimaVez.set(r.questaoId, r.respondidaEm);
  }
  const maisAntiga = permitidas
    .filter((q) => ultimaVez.has(q.id))
    .sort((a, b) => ultimaVez.get(a.id)!.localeCompare(ultimaVez.get(b.id)!))[0];
  return maisAntiga ? [maisAntiga.id] : [];
}

export function selecionarProximaQuestao(e: EntradaSelecao & { aleatorio: () => number }): string | null {
  const grupo = grupoPreferido(e);
  return grupo.length > 0 ? grupo[Math.floor(e.aleatorio() * grupo.length)] : null;
}
```

- [ ] 8.4 XP (`src/regras/gamificacao.ts`) e o teste (`src/regras/gamificacao.test.ts`):

```ts
// gamificacao.ts (o passo 14 acrescenta as conquistas e o passo 15, o ranking)
import type { Nivel } from '@/dados/tipos';

export const XP_POR_NIVEL: Record<Nivel, number> = { facil: 10, medio: 20, dificil: 35 };
export const XP_ERRO = 2;

/** RN03: acerto vale pelo nível da questão; erro vale 2 de participação. */
export const xpPorResposta = (nivelQuestao: Nivel, acertou: boolean) => (acertou ? XP_POR_NIVEL[nivelQuestao] : XP_ERRO);
```

```ts
// gamificacao.test.ts
import { describe, expect, it } from 'vitest';
import { xpPorResposta } from './gamificacao';

describe('XP (RN03)', () => {
  it('RN03: acerto Fácil 10, Médio 20, Difícil 35; erro 2', () => {
    expect([xpPorResposta('facil', true), xpPorResposta('medio', true), xpPorResposta('dificil', true)]).toEqual([10, 20, 35]);
    expect([xpPorResposta('facil', false), xpPorResposta('dificil', false)]).toEqual([2, 2]);
  });
});
```

- [ ] 8.5 Sequência e lembrete: teste primeiro (`src/regras/sequencia.test.ts`):

```ts
import { describe, expect, it } from 'vitest';
import { diaNoFuso } from '@/lib/fuso';
import { atualizarSequencia, deveGerarLembrete, horasDeInatividade, sequenciaAtual } from './sequencia';

describe('sequência de dias (RN04)', () => {
  it('RN04: mesmo dia não muda; dia seguinte soma; depois de um dia sem uso volta a 1', () => {
    expect(atualizarSequencia(4, '2026-11-03', '2026-11-03')).toEqual({ diasStreak: 4, ultimoDiaUso: '2026-11-03' });
    expect(atualizarSequencia(4, '2026-11-03', '2026-11-04')).toEqual({ diasStreak: 5, ultimoDiaUso: '2026-11-04' });
    expect(atualizarSequencia(4, '2026-11-02', '2026-11-04')).toEqual({ diasStreak: 1, ultimoDiaUso: '2026-11-04' });
    expect(atualizarSequencia(0, null, '2026-11-04')).toEqual({ diasStreak: 1, ultimoDiaUso: '2026-11-04' });
  });
  it('RN04: dia de uso no fuso de Brasília — 22h30 de 10/03 (01h30 UTC de 11/03) conta para 10/03', () => {
    const hoje = diaNoFuso(new Date('2026-03-11T01:30:00Z'));
    expect(hoje).toBe('2026-03-10');
    expect(atualizarSequencia(2, '2026-03-09', hoje).diasStreak).toBe(3);
  });
  it('RN04: a sequência vale até o fim de hoje e zera quando um dia termina sem uso', () => {
    expect(sequenciaAtual(4, '2026-11-04', '2026-11-04')).toBe(4);
    expect(sequenciaAtual(4, '2026-11-03', '2026-11-04')).toBe(4);
    expect(sequenciaAtual(4, '2026-11-02', '2026-11-04')).toBe(0);
    expect(sequenciaAtual(0, null, '2026-11-04')).toBe(0);
  });
});

describe('lembrete por inatividade (RF09, RN04)', () => {
  const base = { receberLembretes: true, temTrilhaEmAndamento: true, ultimaAtividadeEm: '2026-11-01T23:00:00.000Z', ultimoLembreteEm: null, limiteHoras: 48 };
  it('conta as horas desde a última atividade', () => {
    expect(horasDeInatividade('2026-11-01T23:00:00.000Z', new Date('2026-11-03T23:00:00.000Z'))).toBe(48);
  });
  it('RF09: só passa do limite depois de 48 h, com trilha iniciada e a opção ligada', () => {
    expect(deveGerarLembrete({ ...base, agora: new Date('2026-11-03T23:00:00.000Z') })).toBe(false); // exatamente 48 h
    expect(deveGerarLembrete({ ...base, agora: new Date('2026-11-03T23:01:00.000Z') })).toBe(true);
    expect(deveGerarLembrete({ ...base, receberLembretes: false, agora: new Date('2026-11-05T00:00:00.000Z') })).toBe(false);
    expect(deveGerarLembrete({ ...base, temTrilhaEmAndamento: false, agora: new Date('2026-11-05T00:00:00.000Z') })).toBe(false);
  });
  it('RF09: um lembrete por período de inatividade', () => {
    const agora = new Date('2026-11-05T00:00:00.000Z');
    expect(deveGerarLembrete({ ...base, ultimoLembreteEm: '2026-11-04T00:00:00.000Z', agora })).toBe(false);
    expect(deveGerarLembrete({ ...base, ultimoLembreteEm: '2026-11-01T22:00:00.000Z', agora })).toBe(true);
  });
});
```

Implementação (`src/regras/sequencia.ts`):

```ts
import { diasEntre } from '@/lib/fuso';

/** RN04: registra um dia de uso (AAAA-MM-DD no fuso de São Paulo). */
export function atualizarSequencia(diasStreak: number, ultimoDiaUso: string | null, hoje: string): { diasStreak: number; ultimoDiaUso: string } {
  if (ultimoDiaUso === hoje) return { diasStreak, ultimoDiaUso };
  if (ultimoDiaUso && diasEntre(ultimoDiaUso, hoje) === 1) return { diasStreak: diasStreak + 1, ultimoDiaUso: hoje };
  return { diasStreak: 1, ultimoDiaUso: hoje };
}

/** RN04: a sequência guardada vale se o último dia de uso foi hoje ou ontem; senão, um dia terminou sem uso. */
export function sequenciaAtual(diasStreak: number, ultimoDiaUso: string | null, hoje: string): number {
  if (!ultimoDiaUso) return 0;
  return diasEntre(ultimoDiaUso, hoje) <= 1 ? diasStreak : 0;
}

export function horasDeInatividade(ultimaAtividadeEm: string | null, agora: Date): number | null {
  return ultimaAtividadeEm ? (agora.getTime() - Date.parse(ultimaAtividadeEm)) / 3_600_000 : null;
}

/** RF09: inatividade acima do limite, com trilha iniciada e não concluída, uma vez por período. */
export function deveGerarLembrete(e: {
  receberLembretes: boolean;
  temTrilhaEmAndamento: boolean;
  ultimaAtividadeEm: string | null;
  ultimoLembreteEm: string | null;
  limiteHoras: number;
  agora: Date;
}): boolean {
  if (!e.receberLembretes || !e.temTrilhaEmAndamento || !e.ultimaAtividadeEm) return false;
  if ((horasDeInatividade(e.ultimaAtividadeEm, e.agora) ?? 0) <= e.limiteHoras) return false;
  return !(e.ultimoLembreteEm && e.ultimoLembreteEm >= e.ultimaAtividadeEm);
}
```

- [ ] 8.6 A sequência passa a ser atualizada a cada lição ou quiz concluído. Em `local/comum.ts`, completar `registrarAtividade`:

```ts
import { diaNoFuso } from '@/lib/fuso';
import { atualizarSequencia } from '@/regras/sequencia';

export function registrarAtividade(banco: BancoDados, usuarioId: string, instante: Date): void {
  const usuario = banco.usuarios.find((u) => u.id === usuarioId)!;
  const sequencia = atualizarSequencia(usuario.diasStreak, usuario.ultimoDiaUso, diaNoFuso(instante));
  usuario.diasStreak = sequencia.diasStreak;
  usuario.ultimoDiaUso = sequencia.ultimoDiaUso;
  usuario.ultimaAtividadeEm = instante.toISOString();
}
```

- [ ] 8.7 Rodar `npm run test`: motor, XP e sequência passam, incluindo a reprodução do histórico do jovem principal e o roteiro de +75 XP.

Conferir: `npm run test`, `npm run lint`, `npm run build`.

O que o usuário testa:
1. `npm run test`: ver os testes `RN02`, `RN03` e `RN04` passando, inclusive os perfis sintéticos (30%, 60% e 90%) e o histórico do Alex reproduzido pelo motor.
2. Nada muda na tela neste passo.

Commit sugerido: `feat: motor adaptativo, XP e sequência de dias (RN02, RN03, RN04)`.

---

## Passo 9 — T11 Quiz e T12 Resultado, com o banco de 48 questões (Essencial)

Ler antes: PRD 2.5 (T11 e T12), 6.6; decisões 2, 9 e 10 da 7.5.

Arquivos:
- Criar: `src/lib/texto.ts`, `src/lib/texto.test.ts`, `src/dados/demo/questoes.ts`, `src/dados/demo/questoes.test.ts`, `src/dados/repositorios/local/quiz.ts`, `src/dados/repositorios/local/usuario.ts`, `src/hooks/dados/useQuiz.ts`, `src/hooks/dados/useUsuario.ts`, `src/components/Celebracao.tsx`, `src/pages/jovem/Quiz.tsx`, `src/pages/jovem/ResultadoQuiz.tsx`.
- Modificar: `src/dados/demo/historico.ts`, `src/dados/demo/index.ts` (questões e `VERSAO_DADOS = 2`), `contratos.ts` (acrescentar `RepositorioQuiz` e `RepositorioUsuario`), `local/index.ts`, `src/app/rotas.tsx`.

Tarefas:

- [ ] 9.1 Normalização de texto (usada para comparar enunciados com o teste diagnóstico; a mesma regra existe no SQL da etapa 2):

```ts
// src/lib/texto.ts
/** Minúsculas, sem acentos, sem pontuação e com espaços simples. */
export function normalizarTexto(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}
```

```ts
// src/lib/texto.test.ts
import { expect, it } from 'vitest';
import { normalizarTexto } from './texto';

it('normaliza acentos, maiúsculas e pontuação', () => {
  expect(normalizarTexto('  Verdadeiro OU falso: ações?  ')).toBe('verdadeiro ou falso acoes');
});
```

- [ ] 9.2 Banco de 48 questões (`src/dados/demo/questoes.ts`, exportando `QUESTOES: Questao[]`). Regras (PRD 6.6):
  - os ids e níveis seguem exatamente `ESTRUTURA_QUESTOES` (passo 8); `quizId` é o da lição; `ativa: true`; `criadoEm` e `atualizadoEm` com uma data fixa (`'2026-10-01T12:00:00.000Z'`);
  - cada questão é sobre o tema da sua lição (PRD 6.5);
  - Fácil = conceito direto; Médio = conta simples ou comparação; Difícil = duas etapas ou uma armadilha comum (dividir a taxa anual por 12; esquecer os juros do rotativo antes do parcelamento);
  - 4 alternativas diferentes, 1 correta (variar a posição da correta entre 0 e 3), explicação de 1 a 3 frases;
  - enunciado de 10 a 300 caracteres e explicação de 10 a 400 (os mesmos limites do banco na etapa 2);
  - nunca repetir as perguntas do teste diagnóstico nem variações com os mesmos números (R$ 100 a 2% ao ano por 5 anos; R$ 200 a 3%; poupança a 1% com inflação de 2%; 2% com 4%; ação única x fundo);
  - toda conta conferida.

Exemplos no formato (duas das 48):

```ts
{
  id: 'juros-compostos-2-m1', quizId: 'juros-compostos-2-quiz', nivelDificuldade: 'medio', ativa: true,
  enunciado: 'Você guarda R$ 100,00 por mês numa aplicação que rende 1% ao mês. Depois de 12 meses, o saldo fica mais perto de qual valor?',
  alternativas: ['R$ 1.200,00', 'R$ 1.268,25', 'R$ 1.320,00', 'R$ 1.100,00'], respostaCorreta: 1,
  explicacao: 'Cada aporte rende juros sobre juros a partir do mês em que entra. Por isso o saldo passa dos R$ 1.200,00 aportados e chega a R$ 1.268,25.',
  criadoEm: '2026-10-01T12:00:00.000Z', atualizadoEm: '2026-10-01T12:00:00.000Z',
},
{
  id: 'juros-compostos-3-d1', quizId: 'juros-compostos-3-quiz', nivelDificuldade: 'dificil', ativa: true,
  enunciado: 'Uma aplicação rende 12% ao ano. Qual é a taxa mensal equivalente?',
  alternativas: ['Exatamente 1% ao mês', 'Cerca de 0,95% ao mês', 'Cerca de 1,2% ao mês', 'Exatamente 12% ao mês'], respostaCorreta: 1,
  explicacao: 'Dividir por 12 ignora os juros sobre juros. Pela equivalência, (1 + 0,12)^(1/12) − 1 ≈ 0,95% ao mês.',
  criadoEm: '2026-10-01T12:00:00.000Z', atualizadoEm: '2026-10-01T12:00:00.000Z',
},
```

(1,12^(1/12) − 1 = 0,9489%.) Ao fim, pedir ao usuário que o grupo revise as 48 questões.

- [ ] 9.3 Teste do banco (`src/dados/demo/questoes.test.ts`):

```ts
import { describe, expect, it } from 'vitest';
import { normalizarTexto } from '@/lib/texto';
import { criarDadosDemo } from '.';
import { ESTRUTURA_QUESTOES } from './estruturaQuestoes';
import { PERGUNTAS_DIAGNOSTICAS } from './perguntasDiagnosticas';
import { QUESTOES } from './questoes';
import { ID_ALEX } from './usuarios';

describe('banco de questões (PRD 6.6)', () => {
  it('48 questões com os ids, quizzes e níveis da estrutura', () => {
    expect(QUESTOES).toHaveLength(48);
    const porId = new Map(QUESTOES.map((q) => [q.id, q]));
    for (const item of ESTRUTURA_QUESTOES) {
      expect(porId.get(item.id)).toMatchObject({ quizId: item.quizId, nivelDificuldade: item.nivel, ativa: true });
    }
  });
  it.each(QUESTOES.map((q) => [q.id, q] as const))('%s: alternativas, correta e tamanhos válidos', (_id, q) => {
    expect(new Set(q.alternativas.map(normalizarTexto)).size).toBe(4);
    expect([0, 1, 2, 3]).toContain(q.respostaCorreta);
    expect(q.enunciado.length).toBeGreaterThanOrEqual(10);
    expect(q.enunciado.length).toBeLessThanOrEqual(300);
    expect(q.explicacao.length).toBeGreaterThanOrEqual(10);
    expect(q.explicacao.length).toBeLessThanOrEqual(400);
  });
  it('nenhuma questão repete uma pergunta do teste diagnóstico', () => {
    const diagnosticas = PERGUNTAS_DIAGNOSTICAS.map((p) => normalizarTexto(p.enunciado));
    for (const q of QUESTOES) expect(diagnosticas).not.toContain(normalizarTexto(q.enunciado));
  });
  it('o histórico do jovem principal aponta para questões reais, com nível e alternativa coerentes', () => {
    const banco = criarDadosDemo(new Date('2026-11-04T15:00:00Z'));
    for (const r of banco.respostasQuiz.filter((x) => x.usuarioId === ID_ALEX)) {
      const q = QUESTOES.find((x) => x.id === r.questaoId)!;
      expect(q.nivelDificuldade).toBe(r.nivelQuestao);
      expect(r.alternativaMarcada === q.respostaCorreta).toBe(r.acertou);
    }
  });
});
```

- [ ] 9.4 Ligar as questões aos dados de demonstração:
  - `historico.ts`: importar `QUESTOES` e trocar `alternativaMarcada: 0` por `alternativaMarcada: marcada(questaoId, acertou)`, com `const marcada = (id: string, acertou: boolean) => { const q = QUESTOES.find((x) => x.id === id)!; return acertou ? q.respostaCorreta : (q.respostaCorreta + 1) % 4; };`.
  - `demo/index.ts`: `questoes: structuredClone(QUESTOES)` e `VERSAO_DADOS = 2` (o banco do aparelho é recriado com as questões).
  - Rodar `npm run test`: o teste 9.3 passa.

- [ ] 9.5 Repositório do usuário local (`src/dados/repositorios/local/usuario.ts`): `meuUsuario()` devolve o usuário da sessão; `definirReceberLembretes(valor)` grava `receberLembretes`. Hook `useMeuUsuario()` em `src/hooks/dados/useUsuario.ts` (chave `chaves.usuario`).

- [ ] 9.6 Repositório do quiz local (`src/dados/repositorios/local/quiz.ts`), que orquestra as regras do passo 8:

```ts
import { alterarBanco, carregarBanco } from '@/dados/bancoLocal';
import { LICOES, QUIZZES } from '@/dados/demo/trilhas';
import type { Questao, ResultadoResposta } from '@/dados/tipos';
import { agora } from '@/lib/relogio';
import { xpPorResposta } from '@/regras/gamificacao';
import { nivelAtualDaTrilha, porData, proximoNivel, selecionarProximaQuestao, type CandidataQuestao } from '@/regras/motorAdaptativo';
import type { RepositorioQuiz } from '../contratos';
import { estaOnline, parametrosAtuaisLocal, registrarAtividade, responder, usuarioDaSessao } from './comum';

const licaoDoQuiz = (quizId: string) => {
  const quiz = QUIZZES.find((q) => q.id === quizId);
  if (!quiz) throw new Error('Quiz não encontrado');
  return { quiz, licao: LICOES.find((l) => l.id === quiz.licaoId)! };
};
const candidataDe = (q: Questao): CandidataQuestao => ({ id: q.id, licaoOrdem: licaoDoQuiz(q.quizId).licao.ordem, nivel: q.nivelDificuldade, ativa: q.ativa });
const daTrilha = (questoes: Questao[], trilhaId: string) => questoes.filter((q) => licaoDoQuiz(q.quizId).licao.trilhaId === trilhaId);

export const quizLocal: RepositorioQuiz = {
  async proximaQuestao(quizId) {
    const usuarioId = usuarioDaSessao();
    const banco = carregarBanco();
    const { quiz, licao } = licaoDoQuiz(quizId);
    if (!banco.progressos.find((p) => p.usuarioId === usuarioId && p.licaoId === licao.id)?.leituraConcluidaEm) throw new Error('Leia a lição antes do quiz');
    const minhas = banco.respostasQuiz.filter((r) => r.usuarioId === usuarioId);
    const noQuiz = minhas.filter((r) => r.quizId === quizId);
    if (noQuiz.length >= quiz.numeroQuestoes) return responder(null);
    const naTrilha = minhas.filter((r) => r.trilhaId === licao.trilhaId);
    const id = selecionarProximaQuestao({
      nivelAtual: nivelAtualDaTrilha(naTrilha), licaoAtualOrdem: licao.ordem,
      questoesDaTrilha: daTrilha(banco.questoes, licao.trilhaId).map(candidataDe),
      respondidasPeloJovem: naTrilha.map((r) => ({ questaoId: r.questaoId, respondidaEm: r.respondidaEm })),
      respondidasNesteQuiz: noQuiz.map((r) => r.questaoId), aleatorio: Math.random,
    });
    if (!id) throw new Error('Não há questões ativas para este quiz');
    const q = banco.questoes.find((x) => x.id === id)!;
    return responder({
      id: q.id, enunciado: q.enunciado, alternativas: q.alternativas, nivelDificuldade: q.nivelDificuldade,
      licaoOrdem: licaoDoQuiz(q.quizId).licao.ordem, numeroNoQuiz: noQuiz.length + 1, totalNoQuiz: quiz.numeroQuestoes,
    });
  },

  async responder(quizId, questaoId, alternativa) {
    const usuarioId = usuarioDaSessao();
    const resultado = alterarBanco((banco): ResultadoResposta => {
      const { quiz, licao } = licaoDoQuiz(quizId);
      const progresso = banco.progressos.find((p) => p.usuarioId === usuarioId && p.licaoId === licao.id);
      if (!progresso?.leituraConcluidaEm) throw new Error('Leia a lição antes do quiz');
      const minhas = banco.respostasQuiz.filter((r) => r.usuarioId === usuarioId);
      const noQuiz = minhas.filter((r) => r.quizId === quizId);
      if (noQuiz.length >= quiz.numeroQuestoes) throw new Error('Este quiz já foi concluído');
      const questao = banco.questoes.find((q) => q.id === questaoId);
      if (!questao || !questao.ativa) throw new Error('Questão indisponível');
      const daQuestao = licaoDoQuiz(questao.quizId).licao;
      if (daQuestao.trilhaId !== licao.trilhaId || daQuestao.ordem > licao.ordem || noQuiz.some((r) => r.questaoId === questaoId)) {
        throw new Error('Questão fora deste quiz');
      }

      const naTrilha = minhas.filter((r) => r.trilhaId === licao.trilhaId).sort(porData);
      const parametros = parametrosAtuaisLocal(banco);
      const nivelAntes = nivelAtualDaTrilha(naTrilha);
      const acertou = alternativa === questao.respostaCorreta;
      const xpGanho = xpPorResposta(questao.nivelDificuldade, acertou);
      const nivelDepois = proximoNivel(nivelAntes, [...naTrilha.map((r) => r.acertou), acertou], {
        janela: parametros.janela_motor, limiarSubida: parametros.limiar_subida, limiarDescida: parametros.limiar_descida,
      });
      const instante = agora();
      banco.respostasQuiz.push({
        id: crypto.randomUUID(), usuarioId, quizId, questaoId, trilhaId: licao.trilhaId, nivelQuestao: questao.nivelDificuldade,
        alternativaMarcada: alternativa, acertou, xpGanho, nivelTrilhaApos: nivelDepois, respondidaEm: instante.toISOString(),
      });
      banco.usuarios.find((u) => u.id === usuarioId)!.xpTotal += xpGanho;

      const doQuiz = banco.respostasQuiz.filter((r) => r.usuarioId === usuarioId && r.quizId === quizId);
      const acertosNoQuiz = doQuiz.filter((r) => r.acertou).length;
      const xpNoQuiz = doQuiz.reduce((s, r) => s + r.xpGanho, 0);
      const quizConcluido = doQuiz.length >= quiz.numeroQuestoes;
      let trilhaConcluida = false;
      if (quizConcluido) {
        Object.assign(progresso, { quizConcluidoEm: instante.toISOString(), acertos: acertosNoQuiz, xpGanho: xpNoQuiz, sincronizadoOffline: estaOnline() });
        registrarAtividade(banco, usuarioId, instante);
        trilhaConcluida = banco.progressos.filter((p) => p.usuarioId === usuarioId && p.trilhaId === licao.trilhaId && p.quizConcluidoEm).length >= 3;
      }
      return {
        acertou, respostaCorreta: questao.respostaCorreta, explicacao: questao.explicacao, xpGanho, nivelAntes, nivelDepois,
        quizConcluido, acertosNoQuiz, xpNoQuiz, trilhaConcluida, conquistasNovas: [], // o passo 14 preenche as conquistas
      };
    });
    return responder(resultado);
  },
};
```

`src/hooks/dados/useQuiz.ts`: `useResponder()` (mutação; ao terminar, invalida `usuario`, `progresso`, `respostas`, `ranking`, `conquistas` e `notificacoes`). A próxima questão não é uma consulta em cache (o sorteio mudaria a cada nova busca): a tela chama `repositorios.quiz.proximaQuestao` direto (9.7).

- [ ] 9.7 T11 Quiz (`/trilhas/:trilha/licoes/:licao/quiz`, modo foco):
  - Ao abrir: se a lição não tem leitura concluída, `Navigate` para a lição com o toast "Leia a lição antes do quiz"; se o quiz já foi concluído (ou `proximaQuestao` devolver `null`), `Navigate` para `.../resultado`.
  - Buscar a questão num efeito com proteção contra resposta antiga (o modo estrito do React roda o efeito duas vezes):

```tsx
const [questao, setQuestao] = useState<QuestaoPublica | null>(null);
const [pedido, setPedido] = useState(0); // muda para pedir a próxima
useEffect(() => {
  let ignorar = false;
  repositorios.quiz.proximaQuestao(quizId).then((q) => { if (!ignorar) setQuestao(q); }).catch((e: Error) => toast.error(e.message));
  return () => { ignorar = true; };
}, [quizId, pedido]);
```

  - Topo: "Quiz da Lição N", "Questão n de 3" (`questao.numeroNoQuiz` e `totalNoQuiz`) com `Progress`, e o botão Fechar (`X`, `aria-label="Fechar quiz"`) que abre um `AlertDialog` com "Sair do quiz? As respostas já dadas ficam salvas." e volta para a trilha.
  - Questão: `EtiquetaNivel`, enunciado e 4 alternativas como botões grandes (mínimo 44 px, letra A a D), com `aria-pressed` na escolhida.
  - Teclado: um `keydown` na janela: teclas 1 a 4 escolhem (enquanto não houver feedback); Enter confirma, ou avança quando houver feedback.
  - "Confirmar resposta" (desabilitado sem escolha) chama `useResponder`. Com o resultado:
    - feedback numa região `aria-live="polite"`: acerto em `bg-acerto-fundo text-acerto`, ícone `CircleCheck` e "Resposta certa! +20 XP", com o link "Ver explicação"; erro em `bg-erro-fundo text-erro`, ícone `CircleX`, "Resposta errada. A correta é a C: {texto}", a explicação e "+2 XP pela participação";
    - as alternativas marcada e correta ganham ícone e texto ("Sua resposta", "Correta"), não só cor;
    - `toast.success('+20 XP')` com o XP ganho;
    - se `nivelDepois` for maior que `nivelAntes`: "Mandou bem! As próximas questões vão ficar mais desafiadoras."; se for menor: "Tudo certo! As próximas questões vão ficar um pouco mais tranquilas para você firmar o conteúdo.";
    - botão "Próxima questão" (limpa a escolha e o feedback e faz `setPedido((n) => n + 1)`) ou, quando `quizConcluido`, "Ver resultado" (`navigate('.../resultado', { state: { resultado } })`).
  - Carregando: `Skeleton` no lugar da questão.
  - Dica de teclado só no desktop (PRD 7.4): "Use as teclas 1 a 4 e Enter", visível só com `@media (pointer: fine)` (classe `hidden [@media(pointer:fine)]:block`); a mesma dica entra no `PerguntaTeste` do passo 12.

- [ ] 9.8 `src/components/Celebracao.tsx`: um bloco com ícone `PartyPopper` e brilhos (`Sparkles`) que entram com escala (animação CSS de até 1 s; o CSS global do passo 1 já desliga a animação com `prefers-reduced-motion`).

- [ ] 9.9 T12 Resultado (`/trilhas/:trilha/licoes/:licao/resultado`, modo foco):
  - Dados: `location.state.resultado` quando vier do quiz. Se a página for recarregada (sem `state`), usar o progresso da lição (`acertos`, `xpGanho`), o nível atual da trilha (`nivelAtualDaTrilha`) e o status da trilha.
  - Mostrar "Você acertou X de 3", "+N XP" (`text-xp`), "Nível atual da trilha" com `EtiquetaNivel` e a sequência (`sequenciaAtual(usuario.diasStreak, usuario.ultimoDiaUso, diaNoFuso(agora()))`, com ícone `Flame` em `text-sequencia-icone` e o texto "N dias seguidos").
  - Botões: Próxima lição (principal, para a lição seguinte) e Voltar à trilha.
  - Na última lição: "Trilha concluída!" com `Celebracao` e o botão Ver trilhas; se `trilhasConcluidas(progressos) === 4`, também o card "Teste final liberado" com o botão Fazer agora (`/pos-teste`).
  - Conquistas: o passo 14 acrescenta.

- [ ] 9.10 Rotas: trocar as telas provisórias de quiz e resultado.

Conferir: `npm run test`, `npm run lint`, `npm run build`; critérios de T11 e T12 (menos conquistas).

O que o usuário testa (entrar como jovem; Juros Compostos → Lição 2 → Concluir leitura):
1. O quiz mostra "Questão 1 de 3", a etiqueta do nível e 4 alternativas; teclas 1 a 4 e Enter funcionam.
2. Acertar as duas primeiras: depois da segunda aparece "Mandou bem!..." e a terceira vem com a etiqueta Difícil.
3. Acerto em verde com ícone e "+20 XP"; erro em vermelho com a correta e a explicação.
4. Fechar no meio e voltar: retoma da próxima questão.
5. Resultado com "+75 XP" (se acertou as 3), nível Difícil e a sequência em 5 dias.
6. Revisar as 48 questões com o grupo (correção e clareza).

Commit sugerido: `feat: quiz adaptativo, resultado e banco de 48 questões (RF02, RF06)`.

---
## Passo 10 — T07 Início e o topo da área do jovem (Essencial)

Ler antes: PRD 2.3 (T07), 4.2 e 5.1.

Arquivos:
- Criar: `src/hooks/useRelogio.ts`, `src/components/TopoJovem.tsx`, `src/dados/repositorios/local/notificacoes.ts` (só a contagem neste passo), `src/hooks/dados/useNotificacoes.ts`, `src/pages/jovem/Inicio.tsx`.
- Modificar: `contratos.ts` (acrescentar `RepositorioNotificacoes` com `minhasNotificacoes`), `local/index.ts`, `src/layouts/LayoutJovem.tsx`, `src/app/rotas.tsx`.

Tarefas:

- [ ] 10.1 Relógio reativo (a tela redesenha quando o relógio simulado muda e a cada minuto):

```ts
// src/hooks/useRelogio.ts
import { useEffect, useState } from 'react';
import { assinarAparelho } from '@/dados/aparelho';
import { agora } from '@/lib/relogio';

export function useAgora(): Date {
  const [instante, setInstante] = useState(agora);
  useEffect(() => {
    const atualizar = () => setInstante(agora());
    const id = window.setInterval(atualizar, 60_000);
    const desassinar = assinarAparelho(atualizar);
    return () => { window.clearInterval(id); desassinar(); };
  }, []);
  return instante;
}
```

- [ ] 10.2 Notificações locais, primeira parte: `minhasNotificacoes()` devolve as do usuário da sessão, da mais recente para a mais antiga. Hook `useNotificacoes()` e `useNaoLidas()` (quantidade com `lida === false`).

- [ ] 10.3 `src/components/TopoJovem.tsx`, fixo no alto da coluna de 430 px, em todas as telas com barra inferior:
  - à esquerda: a saudação "Olá, {primeiro nome}!" no Início, ou o título da tela nas outras (prop `titulo`);
  - à direita: XP total (ícone `Sparkles` em `text-xp-icone` + "120 XP" em `text-xp tabular-nums`, com `aria-label="120 XP no total"`); sequência (ícone `Flame` em `text-sequencia-icone` + o número, com `aria-label="Sequência de 4 dias"`), calculada com `sequenciaAtual(usuario.diasStreak, usuario.ultimoDiaUso, diaNoFuso(useAgora()))`; sino (`Bell`, `Link` para `/notificacoes`) com o número de não lidas num círculo e `aria-label="Notificações, 1 não lida"` (ou "Notificações, nenhuma não lida").
  - O `LayoutJovem` passa a ter um `<TopoJovem titulo={...} />`; cada rota informa o título pelo `handle` do React Router (`handle: { titulo: 'Trilhas' }`) e o layout lê com `useMatches()`; o Início usa `handle: { saudacao: true }`.

- [ ] 10.4 T07 Início (`/inicio`), cards nesta ordem (PRD 2.3):
  1. Continuar de onde parei: `continuarDeOndeParei(trilhas, licoes, progressos, respostas)`. "continuar": trilha, "Lição N de 3: {título}", `Progress` da trilha e o botão Continuar (para a lição ou, se `acao === 'quiz'`, para o quiz). "comecar": "Comece por: {trilha}". "todas_concluidas": "Você concluiu todas as trilhas!" com o atalho para `/pos-teste`.
  2. Suas trilhas: as 4 trilhas com `SeloStatus`, "x de 3 lições" e `Progress`; cada linha é um `Link`.
  3. Simuladores: dois atalhos (Juros compostos e Fatura do cartão).
  4. Próxima conquista e posição no ranking, lado a lado: entram nos passos 14 e 15 (até lá, o espaço fica vazio, sem card provisório).
  5. Teste final: entra no passo 13.
  - Enquanto carrega: um `Skeleton` por card.
  - A rota `/inicio` deixa de usar a tela provisória do passo 2.

Conferir: `npm run test`, `npm run lint`, `npm run build`; critérios 1, 2, 3, 6 e 7 de T07 (os itens 4 e 5 entram nos passos 13 a 15).

O que o usuário testa (entrar como jovem):
1. Topo: "Olá, Alex!", 120 XP, sequência 4 e o sino com 1.
2. "Continuar de onde parei" mostra Juros Compostos, Lição 2 de 3, e abre a lição 2.
3. Fazer o quiz da lição 2 e voltar ao Início: XP e sequência mudam sem recarregar.

Commit sugerido: `feat: início do jovem e topo com XP, sequência e notificações`.

---

## Passo 11 — Modo offline simulado (Essencial)

Ler antes: PRD 2.4 (Modo offline e T09) e 6.4.

Arquivos:
- Criar: `src/hooks/useConexao.ts`, `src/components/BannerOffline.tsx`, `src/components/BaixarTrilha.tsx`.
- Modificar: `contratos.ts` (acrescentar `sincronizarPendentes`), `local/progresso.ts`, `src/dados/bancoLocal.ts`, `src/layouts/LayoutJovem.tsx`, `src/layouts/LayoutFoco.tsx`, `src/pages/jovem/Trilhas.tsx`, `src/pages/jovem/Trilha.tsx`, `src/pages/jovem/Licao.tsx`, `src/pages/jovem/Quiz.tsx`.

Tarefas:

- [ ] 11.1 Estado da conexão:

```ts
// src/hooks/useConexao.ts
import { useSyncExternalStore } from 'react';

const assinar = (aoMudar: () => void) => {
  window.addEventListener('online', aoMudar);
  window.addEventListener('offline', aoMudar);
  return () => { window.removeEventListener('online', aoMudar); window.removeEventListener('offline', aoMudar); };
};

export const useConexao = () => useSyncExternalStore(assinar, () => navigator.onLine, () => true);
```

- [ ] 11.2 `BannerOffline`: quando `useConexao()` for `false`, faixa fixa abaixo do topo com ícone `WifiOff` e o texto "Você está sem internet. As trilhas baixadas continuam disponíveis.", com `role="status"`. Entra no `LayoutJovem` e no `LayoutFoco`.

- [ ] 11.3 Trilha baixada (estado do aparelho, PRD 6.4):
  - `src/components/BaixarTrilha.tsx`: botão Baixar trilha (ícone `Download`); ao tocar, `Progress` de 0 a 100% em cerca de 2 s ("Baixando trilha… 60%", com `aria-live="polite"`) e, no fim, `atualizarAparelho({ trilhasBaixadas: [...atuais, trilhaId] })` e o toast "Trilha disponível offline". Já baixada: selo "Disponível offline" (ícone `CircleCheck`). Sem internet: botão desabilitado com o texto "Conecte-se para baixar".
  - T09 mostra o `BaixarTrilha` no cabeçalho; T08 mostra o selo "Disponível offline" nas baixadas.
  - Dados de demonstração: em `bancoLocal.ts`, sempre que os dados de demonstração forem criados (primeira carga e reinício), chamar `atualizarAparelho({ trilhasBaixadas: ['juros-compostos'] })`.

- [ ] 11.4 Bloqueio sem internet nas trilhas não baixadas:
  - T08 e Início: tocar numa trilha não baixada, offline, mostra o toast "Para abrir esta trilha, conecte-se à internet." e não navega.
  - T09, T10 e T11 abertos pela URL, offline, numa trilha não baixada: mostram o mesmo aviso no lugar do conteúdo, com o botão Voltar.

- [ ] 11.5 Sincronização simulada. O passo 9 já grava `sincronizadoOffline: estaOnline()` no progresso. Acrescentar em `local/progresso.ts`:

```ts
async sincronizarPendentes() {
  const usuarioId = usuarioDaSessao();
  const quantidade = alterarBanco((banco) => {
    const pendentes = banco.progressos.filter((p) => p.usuarioId === usuarioId && !p.sincronizadoOffline);
    pendentes.forEach((p) => { p.sincronizadoOffline = true; });
    return pendentes.length;
  });
  return responder(quantidade);
},
```

No `LayoutJovem`, um efeito observa `useConexao()`: quando passa de `false` para `true`, chama `sincronizarPendentes()` e, se a quantidade for maior que zero, mostra o toast "Conexão de volta. Progresso sincronizado." e invalida `progresso`.

- [ ] 11.6 Ranking e simuladores offline: os simuladores não dependem de rede (nada a fazer). O "Atualizado às HH:MM" do ranking entra no passo 15.

Conferir: `npm run lint`, `npm run build`; critérios do modo offline (PRD 2.4).

O que o usuário testa (DevTools → Network → Offline):
1. O banner aparece e some quando a conexão volta.
2. Juros Compostos (baixada) abre lições e quizzes; Cartão de Crédito mostra "Para abrir esta trilha, conecte-se à internet."
3. Fazer o quiz da lição 2 de Juros Compostos offline; ao voltar a conexão, aparece "Conexão de volta. Progresso sincronizado."
4. Baixar Orçamento Pessoal: barra de progresso e selo "Disponível offline", que continua depois de recarregar.

Commit sugerido: `feat: modo offline simulado com trilhas baixadas (RNF02, RNF08)`.

---

## Passo 12 — T05 Pré-teste, com registro por pergunta e pseudônimo (Importante)

Ler antes: PRD 2.2 (regras gerais e T05), 4.4 (regra 3), 6.7; instruções do projeto (Pesquisa e privacidade).

Arquivos:
- Criar: `src/regras/pesquisa.ts`, `src/regras/pesquisa.test.ts`, `src/components/PerguntaTeste.tsx`, `src/pages/jovem/PreTeste.tsx`.
- Modificar: `contratos.ts` (`RepositorioTestes` completo), `local/testes.ts`, `local/index.ts`, `src/hooks/dados/useTestes.ts`, `src/app/rotas.tsx`.

Tarefas:

- [ ] 12.1 Regras da pesquisa, primeira parte (o passo 17 acrescenta as métricas). Teste primeiro (`src/regras/pesquisa.test.ts`):

```ts
import { describe, expect, it } from 'vitest';
import { diferencaPp, formaDoTeste, percentualDeAcerto } from './pesquisa';

describe('teste diagnóstico (RF05)', () => {
  it('RF05: pré-teste usa a Forma A e pós-teste a Forma B', () => {
    expect(formaDoTeste('pre')).toBe('A');
    expect(formaDoTeste('pos')).toBe('B');
  });
  it('RF05: percentual de acerto e diferença em pontos percentuais', () => {
    expect(percentualDeAcerto(1, 3)).toBeCloseTo(33.333, 3);
    expect(diferencaPp(1, 3, 3)).toBeCloseTo(66.667, 3);
    expect(diferencaPp(3, 2, 3)).toBeCloseTo(-33.333, 3);
  });
});
```

Implementação (`src/regras/pesquisa.ts`):

```ts
import type { FormaTeste, TipoTeste } from '@/dados/tipos';

export const formaDoTeste = (tipo: TipoTeste): FormaTeste => (tipo === 'pre' ? 'A' : 'B');
export const percentualDeAcerto = (nota: number, totalPerguntas: number) => (nota / totalPerguntas) * 100;
/** Diferença pós − pré, em pontos percentuais. */
export const diferencaPp = (notaPre: number, notaPos: number, totalPerguntas: number) =>
  percentualDeAcerto(notaPos, totalPerguntas) - percentualDeAcerto(notaPre, totalPerguntas);
```

- [ ] 12.2 Repositório de testes local completo (`local/testes.ts`), mantendo `resumosDoUsuario` do passo 6. O pós-teste exige o pré-teste concluído e as 4 trilhas (ou a liberação de demonstração, do passo 16):

```ts
import { lerAparelho } from '@/dados/aparelho';
import { alterarBanco, carregarBanco } from '@/dados/bancoLocal';
import { PERGUNTAS_DIAGNOSTICAS, VERSAO_TESTE } from '@/dados/demo/perguntasDiagnosticas';
import { TRILHAS } from '@/dados/demo/trilhas';
import type { TesteDiagnostico } from '@/dados/tipos';
import { agora } from '@/lib/relogio';
import { trilhasConcluidas } from '@/regras/progresso';
import { formaDoTeste } from '@/regras/pesquisa';
import type { RepositorioTestes } from '../contratos';
import { responder, usuarioDaSessao } from './comum';

export const testesLocal: RepositorioTestes = {
  meusTestes: () => responder(resumosDoUsuario(usuarioDaSessao())),

  async iniciar(tipo) {
    const usuarioId = usuarioDaSessao();
    const forma = formaDoTeste(tipo);
    const teste = alterarBanco((banco) => {
      const pseudonimo = banco.pseudonimos[usuarioId];
      if (!pseudonimo) throw new Error('O administrador não faz os testes');
      const doUsuario = banco.testes.filter((t) => t.pseudonimo === pseudonimo);
      if (tipo === 'pos') {
        if (!doUsuario.some((t) => t.tipoTeste === 'pre' && t.concluidoEm)) throw new Error('Faça o teste inicial primeiro');
        const meus = banco.progressos.filter((p) => p.usuarioId === usuarioId);
        if (trilhasConcluidas(meus) < TRILHAS.length && !lerAparelho().posTesteLiberadoDemo) throw new Error('Conclua as 4 trilhas para liberar o teste final');
      }
      const existente = doUsuario.find((t) => t.tipoTeste === tipo);
      if (existente) return existente;
      const novo: TesteDiagnostico = { id: crypto.randomUUID(), pseudonimo, tipoTeste: tipo, forma, versao: VERSAO_TESTE, iniciadoEm: agora().toISOString(), concluidoEm: null, pontuacaoTotal: null };
      banco.testes.push(novo);
      return novo;
    });
    const banco = carregarBanco();
    return responder({
      resumo: resumosDoUsuario(usuarioId).find((r) => r.tipoTeste === tipo)!,
      perguntas: PERGUNTAS_DIAGNOSTICAS.filter((p) => p.forma === teste.forma && p.versao === teste.versao)
        .sort((a, b) => a.numero - b.numero)
        .map(({ id, numero, enunciado, alternativas }) => ({ id, numero, enunciado, alternativas })),
      respondidas: banco.respostasTeste.filter((r) => r.testeId === teste.id).map((r) => r.perguntaId),
    });
  },

  async responder(tipo, perguntaId, alternativa) {
    const usuarioId = usuarioDaSessao();
    const concluido = alterarBanco((banco) => {
      const teste = banco.testes.find((t) => t.pseudonimo === banco.pseudonimos[usuarioId] && t.tipoTeste === tipo);
      if (!teste) throw new Error('Teste não iniciado');
      if (teste.concluidoEm) throw new Error('Teste já concluído');
      const pergunta = PERGUNTAS_DIAGNOSTICAS.find((p) => p.id === perguntaId && p.forma === teste.forma && p.versao === teste.versao);
      if (!pergunta) throw new Error('Pergunta não pertence a este teste');
      if (!banco.respostasTeste.some((r) => r.testeId === teste.id && r.perguntaId === perguntaId)) {
        banco.respostasTeste.push({ id: crypto.randomUUID(), testeId: teste.id, perguntaId, alternativaMarcada: alternativa, acertou: alternativa === pergunta.alternativaCorreta, respondidaEm: agora().toISOString() });
      }
      const respostas = banco.respostasTeste.filter((r) => r.testeId === teste.id);
      const total = PERGUNTAS_DIAGNOSTICAS.filter((p) => p.forma === teste.forma && p.versao === teste.versao).length;
      if (respostas.length < total) return false;
      teste.concluidoEm = agora().toISOString();
      teste.pontuacaoTotal = respostas.filter((r) => r.acertou).length;
      return true;
    });
    return responder({ concluido }); // nunca devolve se acertou (é medição, não quiz)
  },
};
```

Hooks em `useTestes.ts`: `useIniciarTeste()` e `useResponderPergunta()` (mutação que invalida `testes`).

- [ ] 12.3 `src/components/PerguntaTeste.tsx` (usado no pré e no pós): "Pergunta n de 3" com `Progress`; enunciado; `RadioGroup` com as alternativas como opções grandes (mínimo 44 px); botão Confirmar desabilitado sem escolha; teclas 1 a 4 (1 a 3 quando houver três alternativas) escolhem e Enter confirma (mesmo `keydown` do quiz). Não há botão de voltar.

- [ ] 12.4 T05 Pré-teste (`/pre-teste`, modo foco). Telas internas, por estado: introdução → perguntas → agradecimento.
  - Ao abrir: se o pré-teste já foi concluído, `Navigate` para `/inicio`.
  - Introdução: título "Antes de começar, um teste rápido" e o texto do PRD T05; botão Começar chama `useIniciarTeste('pre')` e vai para a primeira pergunta ainda não respondida (`respondidas` permite retomar depois de recarregar).
  - Perguntas: `PerguntaTeste`; Confirmar chama `useResponderPergunta('pre', pergunta.id, alternativa)`; quando `concluido`, mostra o agradecimento.
  - Agradecimento: "Agradecemos por responder! Suas trilhas estão liberadas." e o botão "Ir para o início" (invalida `testes` e navega).
  - No topo, só o botão Sair (encerra a sessão).
  - Nenhuma tela mostra a correta, a nota ou XP.

- [ ] 12.5 Rota `/pre-teste` com a tela real.

Conferir: `npm run test`, `npm run lint`, `npm run build`; critérios de T05.

O que o usuário testa:
1. Criar uma conta nova: cai na introdução do pré-teste; tentar abrir `/trilhas` volta para o pré-teste.
2. Responder as 3 perguntas com teclado (1 a 4 e Enter); nenhuma tela mostra acerto, nota ou XP.
3. Recarregar no meio: retoma da próxima pergunta.
4. Depois do agradecimento, as trilhas abrem.
5. DevTools → Local Storage → `efg:dados`: o teste novo está em `testes` com o pseudônimo, e as 3 respostas em `respostasTeste`, com data e hora; o nome não aparece nesses registros.

Commit sugerido: `feat: pré-teste diagnóstico com respostas por pergunta e pseudônimo (RF05, RNF06)`.

---
## Etapa 2 — núcleo da base de dados no Supabase (E2.1 a E2.7)

Ler antes de começar o bloco: PRD 8 (apêndice inteiro); instruções do projeto (Ambientes e deploy; Segurança; Armadilhas conhecidas).

Regras de segurança deste bloco (valem para todo SQL daqui em diante):
- RLS ligada em todas as tabelas. A chave do front é a publishable (pública por design); quem protege é a RLS. A chave `service_role` (ou secret) nunca vai para o front.
- Desde 30/10/2026, tabelas novas no `public` não ficam expostas à Data API sozinhas: cada acesso precisa de `grant` explícito, além da política de RLS.
- O jovem só lê as próprias linhas. Tudo o que mexe em XP, nível, conquistas e testes passa por funções `security definer` com checagem de `auth.uid()`, que validam a regra no servidor. O cliente nunca recebe a resposta correta antes de responder.
- Funções auxiliares ficam no schema `privado`, que não é exposto; as funções chamadas pelo app ficam no `public`, com `execute` revogado de `public` e `anon` e concedido só a `authenticated`.
- Funções `security definer` usam `set search_path = ''` e nomes qualificados (`public.`, `extensions.`, `vault.`). É a forma segura da armadilha do `pgcrypto` descrita nas instruções do projeto (o `hmac` é chamado como `extensions.hmac`).
- `now()` está em UTC; dia de uso com `at time zone 'America/Sao_Paulo'`.
- Cada arquivo de SQL é rodado pelo usuário no SQL Editor, na ordem dos nomes. Os arquivos podem ser rodados de novo sem erro (`if not exists`, `create or replace`, `drop policy if exists`).

---

### E2.1 — Projeto Supabase e configuração do app

Arquivos:
- Criar: `src/lib/supabase/client.ts`, `.env` (fora do git, só na máquina).
- Modificar: `src/vite-env.d.ts`, `package.json` (dependência).

Tarefas:

- [ ] E2.1.1 Ações do usuário no painel do Supabase (passar a lista para ele e esperar a confirmação):
  1. Criar o projeto de desenvolvimento e demonstração (região São Paulo, se disponível) e guardar a senha do banco.
  2. Authentication → Sign In / Providers → Email: desligar "Confirm email" neste projeto, para as contas de teste (`@exemplo.test`) entrarem sem confirmar e-mail. Antes da coleta real, decidir isso de novo no projeto de produção (PRD 8.8).
  3. Authentication → URL Configuration: Site URL `http://localhost:5173`; Redirect URLs `http://localhost:5173/**` e, quando houver, `https://<url-do-worker>/**`.
  4. Project Settings → API Keys: copiar a Project URL e a publishable key (`sb_publishable_...`).

- [ ] E2.1.2 Instalar o cliente:

```bash
npm install @supabase/supabase-js@2
```

- [ ] E2.1.3 `.env` (não vai para o git; o `.gitignore` já cobre):

```
VITE_FONTE_DADOS=local
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

O modo continua `local` até o E2.6.

- [ ] E2.1.4 Tipos das variáveis em `src/vite-env.d.ts`:

```ts
interface ImportMetaEnv {
  readonly VITE_FONTE_DADOS?: 'local' | 'supabase';
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv }
```

- [ ] E2.1.5 `src/lib/supabase/client.ts` (o tipo `Database` entra no E2.5, depois de gerar os tipos):

```ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Cliente do Supabase. A chave é a publishable, pública por design; quem protege os dados é a RLS. */
export const supabase = url && chave ? createClient(url, chave) : null;

export function cliente() {
  if (!supabase) throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env');
  return supabase;
}
```

Conferir: `npm run build` e `npm run dev` (o app continua no modo local, sem mudança visível).

O que o usuário faz: os 4 itens do E2.1.1 e o `.env`.

Commit sugerido: `chore: cliente do Supabase e variáveis de ambiente`.

---

### E2.2 — Esquema: tipos, tabelas, índices e RLS ligada

Arquivo: `supabase/migrations/20261101120000_esquema.sql` (o padrão de nome é o do Supabase CLI, para um dia usar `supabase db push`).

- [ ] E2.2.1 Escrever o arquivo:

```sql
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
```

- [ ] E2.2.2 Conferência (o usuário roda no SQL Editor depois do arquivo):

```sql
select c.relname as tabela, c.relrowsecurity as rls_ligada
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by 1;
```

Esperado: 15 linhas, todas com `rls_ligada = true`.

O que o usuário faz: rodar o arquivo e a conferência. Explicação para ele: o arquivo cria a estrutura do banco (tabelas do apêndice 8.2 do PRD), com os índices e a RLS ligada; ninguém acessa nada ainda.

Commit sugerido: `feat(db): esquema da base de dados com RLS ligada`.

---

### E2.3 — Funções auxiliares, criação do usuário e permissões

Arquivos: `supabase/migrations/20261101120100_funcoes_base.sql` e `supabase/migrations/20261101120200_permissoes.sql`.

- [ ] E2.3.1 `20261101120100_funcoes_base.sql`:

```sql
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

Os metadados do cadastro só registram os aceites; nenhuma permissão depende deles (o papel vem da tabela `usuarios`). Contas criadas pelo painel do Supabase não têm os aceites e são recusadas pelo trigger: criar contas sempre pelo app.

- [ ] E2.3.2 `20261101120200_permissoes.sql`:

```sql
-- Permissões da Data API (explícitas) e políticas de RLS.
-- O jovem lê só o que é dele; XP, nível, testes e conquistas só mudam pelas funções do servidor.

revoke all on all tables in schema public from anon;

-- Conteúdo: leitura para quem está logado.
grant select on public.trilhas, public.licoes, public.quizzes, public.badges to authenticated;
drop policy if exists "conteudo: leitura" on public.trilhas;
create policy "conteudo: leitura" on public.trilhas for select to authenticated using (true);
drop policy if exists "conteudo: leitura" on public.licoes;
create policy "conteudo: leitura" on public.licoes for select to authenticated using (true);
drop policy if exists "conteudo: leitura" on public.quizzes;
create policy "conteudo: leitura" on public.quizzes for select to authenticated using (true);
drop policy if exists "conteudo: leitura" on public.badges;
create policy "conteudo: leitura" on public.badges for select to authenticated using (true);

-- Usuário: lê a própria linha e só altera a opção de lembretes.
grant select on public.usuarios to authenticated;
grant update (receber_lembretes) on public.usuarios to authenticated;
drop policy if exists "usuarios: ver o próprio" on public.usuarios;
create policy "usuarios: ver o próprio" on public.usuarios for select to authenticated
  using ((select auth.uid()) = id);
drop policy if exists "usuarios: alterar o próprio" on public.usuarios;
create policy "usuarios: alterar o próprio" on public.usuarios for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Progresso, respostas do quiz e conquistas: só leitura das próprias.
grant select on public.progresso, public.respostas_quiz, public.usuario_badges to authenticated;
drop policy if exists "progresso: ver o próprio" on public.progresso;
create policy "progresso: ver o próprio" on public.progresso for select to authenticated
  using ((select auth.uid()) = usuario_id);
drop policy if exists "respostas_quiz: ver as próprias" on public.respostas_quiz;
create policy "respostas_quiz: ver as próprias" on public.respostas_quiz for select to authenticated
  using ((select auth.uid()) = usuario_id);
drop policy if exists "usuario_badges: ver as próprias" on public.usuario_badges;
create policy "usuario_badges: ver as próprias" on public.usuario_badges for select to authenticated
  using ((select auth.uid()) = usuario_id);

-- Simulações: ler e criar as próprias.
grant select, insert on public.simulacoes to authenticated;
drop policy if exists "simulacoes: ver as próprias" on public.simulacoes;
create policy "simulacoes: ver as próprias" on public.simulacoes for select to authenticated
  using ((select auth.uid()) = usuario_id);
drop policy if exists "simulacoes: criar as próprias" on public.simulacoes;
create policy "simulacoes: criar as próprias" on public.simulacoes for insert to authenticated
  with check ((select auth.uid()) = usuario_id);

-- Notificações: ler as próprias e marcar como lida.
grant select on public.notificacoes to authenticated;
grant update (lida) on public.notificacoes to authenticated;
drop policy if exists "notificacoes: ver as próprias" on public.notificacoes;
create policy "notificacoes: ver as próprias" on public.notificacoes for select to authenticated
  using ((select auth.uid()) = usuario_id);
drop policy if exists "notificacoes: marcar as próprias" on public.notificacoes;
create policy "notificacoes: marcar as próprias" on public.notificacoes for update to authenticated
  using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);

-- Parâmetros: leitura dos valores (não são secretos); autor e histórico só pela função do administrador.
grant select (chave, valor, alterado_em) on public.parametros_sistema to authenticated;
drop policy if exists "parametros: leitura" on public.parametros_sistema;
create policy "parametros: leitura" on public.parametros_sistema for select to authenticated using (true);

-- Sem acesso direto, só pelas funções: questoes, perguntas_diagnosticas, testes_diagnosticos e respostas_teste
-- (RLS ligada, nenhuma permissão e nenhuma política).
```

- [ ] E2.3.3 Conferência:

```sql
select privado.pseudonimo_de('00000000-0000-0000-0000-000000000000'::uuid);   -- P- e 8 caracteres
select privado.normalizar_texto('Verdadeiro OU falso: ações?');               -- verdadeiro ou falso acoes
select privado.nome_de_exibicao('Bruna Moreira');                             -- Bruna M.
select tgname from pg_trigger where tgname = 'on_auth_user_created';          -- 1 linha
select tablename, policyname, cmd from pg_policies where schemaname = 'public' order by 1, 2;
```

Se o primeiro arquivo der erro no `vault`, ativar a extensão Vault em Database → Extensions e rodar de novo.

O que o usuário faz: rodar os dois arquivos, nesta ordem, e a conferência. Explicação para ele: o primeiro cria as funções de apoio (administrador, parâmetros, pseudônimo com segredo guardado no cofre do Supabase, sequência de dias) e o gatilho que cria o perfil do jovem no cadastro, exigindo os três aceites; o segundo libera, para quem está logado, só o que cada um pode ver.

Commit sugerido: `feat(db): funções de apoio, pseudônimo, criação do usuário e permissões`.

---

### E2.4 — Conteúdo inicial gerado a partir do código

Arquivos:
- Criar: `scripts/gerar-seed.ts`; gerado: `supabase/migrations/20261101120300_conteudo.sql`.

- [ ] E2.4.1 `scripts/gerar-seed.ts` (o conteúdo continua com uma única fonte, `src/dados/demo`):

```ts
import { writeFileSync } from 'node:fs';
import { BADGES } from '../src/dados/demo/badges';
import { PARAMETROS_PADRAO } from '../src/dados/demo/parametros';
import { PERGUNTAS_DIAGNOSTICAS } from '../src/dados/demo/perguntasDiagnosticas';
import { QUESTOES } from '../src/dados/demo/questoes';
import { LICOES, QUIZZES, TRILHAS } from '../src/dados/demo/trilhas';

const texto = (s: string) => `'${s.replace(/'/g, "''")}'`;
const lista = (itens: string[]) => `array[${itens.map(texto).join(', ')}]::text[]`;
const json = (valor: unknown) => `${texto(JSON.stringify(valor))}::jsonb`;

const sql: string[] = [
  '-- Gerado por scripts/gerar-seed.ts (npm run gerar:seed). Não editar à mão: mude src/dados/demo e gere de novo.',
  '-- Conteúdo inicial: trilhas, lições, quizzes, questões, conquistas, perguntas do teste e parâmetros padrão.',
  '-- Questões já existentes não são sobrescritas (o administrador pode tê-las editado).',
  'begin;',
];

for (const t of TRILHAS) {
  sql.push(`insert into public.trilhas (id, slug, titulo, descricao, categoria, ordem) values (${texto(t.id)}, ${texto(t.slug)}, ${texto(t.titulo)}, ${texto(t.descricao)}, ${texto(t.categoria)}, ${t.ordem})
  on conflict (id) do update set slug = excluded.slug, titulo = excluded.titulo, descricao = excluded.descricao, categoria = excluded.categoria, ordem = excluded.ordem;`);
}
for (const l of LICOES) {
  sql.push(`insert into public.licoes (id, trilha_id, ordem, titulo, conteudo, tempo_leitura_min) values (${texto(l.id)}, ${texto(l.trilhaId)}, ${l.ordem}, ${texto(l.titulo)}, ${json(l.conteudo)}, ${l.tempoLeituraMin})
  on conflict (id) do update set titulo = excluded.titulo, conteudo = excluded.conteudo, tempo_leitura_min = excluded.tempo_leitura_min;`);
}
for (const q of QUIZZES) {
  sql.push(`insert into public.quizzes (id, licao_id, tipo_avaliacao, numero_questoes) values (${texto(q.id)}, ${texto(q.licaoId)}, ${texto(q.tipoAvaliacao)}, ${q.numeroQuestoes}) on conflict (id) do nothing;`);
}
for (const q of QUESTOES) {
  sql.push(`insert into public.questoes (id, quiz_id, enunciado, alternativas, resposta_correta, nivel_dificuldade, explicacao, ativa) values (${texto(q.id)}, ${texto(q.quizId)}, ${texto(q.enunciado)}, ${lista(q.alternativas)}, ${q.respostaCorreta}, ${texto(q.nivelDificuldade)}, ${texto(q.explicacao)}, ${q.ativa}) on conflict (id) do nothing;`);
}
for (const b of BADGES) {
  sql.push(`insert into public.badges (id, nome, descricao, criterio_marco, icone, ordem) values (${texto(b.id)}, ${texto(b.nome)}, ${texto(b.criterioMarco)}, ${texto(b.criterioMarco)}, ${texto(b.icone)}, ${b.ordem})
  on conflict (id) do update set nome = excluded.nome, descricao = excluded.descricao, criterio_marco = excluded.criterio_marco, icone = excluded.icone, ordem = excluded.ordem;`);
}
for (const p of PERGUNTAS_DIAGNOSTICAS) {
  sql.push(`insert into public.perguntas_diagnosticas (id, forma, versao, numero, enunciado, alternativas, alternativa_correta) values (${texto(p.id)}, ${texto(p.forma)}, ${texto(p.versao)}, ${p.numero}, ${texto(p.enunciado)}, ${lista(p.alternativas)}, ${p.alternativaCorreta})
  on conflict (id) do update set enunciado = excluded.enunciado, alternativas = excluded.alternativas, alternativa_correta = excluded.alternativa_correta;`);
}
const valores = Object.entries(PARAMETROS_PADRAO).map(([chave, valor]) => `(${texto(chave)}, ${valor})`).join(', ');
sql.push(`insert into public.parametros_sistema (chave, valor)
select x.chave, x.valor from (values ${valores}) as x(chave, valor)
where not exists (select 1 from public.parametros_sistema p where p.chave = x.chave);`);
sql.push('commit;');

writeFileSync('supabase/migrations/20261101120300_conteudo.sql', `${sql.join('\n')}\n`);
console.log(`SQL gerado: ${TRILHAS.length} trilhas, ${LICOES.length} lições, ${QUESTOES.length} questões.`);
```

- [ ] E2.4.2 Gerar e conferir:

```bash
npm run gerar:seed
```

Esperado: "SQL gerado: 4 trilhas, 12 lições, 48 questões." e o arquivo `supabase/migrations/20261101120300_conteudo.sql` criado. O usuário roda o arquivo no SQL Editor e depois:

```sql
select (select count(*) from public.trilhas) as trilhas, (select count(*) from public.licoes) as licoes,
       (select count(*) from public.quizzes) as quizzes, (select count(*) from public.questoes) as questoes,
       (select count(*) from public.badges) as conquistas, (select count(*) from public.perguntas_diagnosticas) as perguntas,
       (select count(distinct chave) from public.parametros_sistema) as parametros;
```

Esperado: 4, 12, 12, 48, 6, 6, 4.

O que o usuário faz: rodar o arquivo gerado e a conferência. Explicação para ele: o arquivo carrega no banco o mesmo conteúdo do app (trilhas, lições, questões, conquistas, perguntas do teste e parâmetros padrão); sempre que o conteúdo mudar no código, basta gerar e rodar de novo.

Commit sugerido: `feat(db): conteúdo inicial gerado a partir dos dados do app`.

---

### E2.5 — Funções do estudo e dos testes

Arquivo: `supabase/migrations/20261101120400_funcoes_estudo.sql`. Cada função repete no servidor uma regra que já tem teste em TypeScript; o comentário diz qual.

- [ ] E2.5.1 Escrever o arquivo:

```sql
-- Funções chamadas pelo app: leitura, quiz adaptativo (RN02, RN03), conquistas (RF08) e teste diagnóstico (RF05).
-- Todas conferem auth.uid() e rodam como dono do banco (security definer), validando as regras no servidor.

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
```

- [ ] E2.5.2 Conferência rápida (no SQL Editor não há usuário logado, então as funções não devolvem dados de ninguém):

```sql
select public.meus_testes();                -- []
select routine_name from information_schema.routines
where routine_schema = 'public' and routine_name in ('concluir_leitura', 'proxima_questao', 'responder_questao', 'meus_testes', 'iniciar_teste', 'registrar_resposta_teste');
```

Esperado: `[]` na primeira e 6 linhas na segunda. A conferência de ponta a ponta é no E2.7.

- [ ] E2.5.3 Tipos do banco para o TypeScript (no Git Bash: o redirecionamento do PowerShell 5 grava em UTF-16 e quebra o arquivo). O `login` do CLI abre o navegador e cria um token com acesso a toda a conta; quem preferir pode criar um token com escopo e usar `SUPABASE_ACCESS_TOKEN`.

```bash
npx supabase login
npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
```

Depois, em `client.ts`: `import type { Database } from './types';` e `createClient<Database>(url, chave)`. Se o CLI não funcionar, seguir sem o tipo genérico: os repositórios do E2.7 tipam as linhas que leem.

O que o usuário faz: rodar o arquivo, a conferência e os dois comandos dos tipos. Explicação para ele: estas são as funções que o app chama para ler a lição, sortear e corrigir a questão (com o motor adaptativo e o XP calculados no servidor), dar as conquistas e registrar o teste diagnóstico pelo pseudônimo.

Commit sugerido: `feat(db): funções do quiz adaptativo, das conquistas e do teste diagnóstico`.

---

### E2.6 — App no Supabase: autenticação e escolha do modo

Arquivos:
- Criar: `src/dados/repositorios/supabase/comum.ts`, `src/dados/repositorios/supabase/sessao.ts`, `src/dados/repositorios/supabase/index.ts`, `src/pages/publico/RedefinirSenha.tsx`.
- Modificar: `src/dados/repositorios/index.ts`, `src/pages/publico/Entrar.tsx`, `src/layouts/LayoutAdmin.tsx`, `src/app/rotas.tsx`.

Tarefas:

- [ ] E2.6.1 Apoio comum (`supabase/comum.ts`):

```ts
import { cliente } from '@/lib/supabase/client';

export { cliente };

/** Traduz os erros do Supabase Auth; as funções do banco já respondem em português. */
export function traduzirErro(erro: { message: string; status?: number } | null): string {
  if (!erro) return 'Algo deu errado. Tente de novo.';
  const m = erro.message;
  if (/invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos';
  if (/already registered|already been registered/i.test(m)) return 'Já existe uma conta com este e-mail';
  if (/database error saving new user/i.test(m)) return 'Não foi possível criar a conta. Confira os aceites e tente de novo.';
  if (/password should be at least/i.test(m)) return 'A senha precisa ter pelo menos 8 caracteres';
  if (/failed to fetch|network/i.test(m)) return 'Sem conexão com o servidor. Confira a internet e tente de novo.';
  return m;
}

export async function usuarioLogadoId(): Promise<string> {
  const { data } = await cliente().auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('Sua sessão expirou. Entre de novo.');
  return id;
}

/** Para funções cuja parte Supabase ainda não foi feita (ver "Se o tempo apertar"). */
export const naoDisponivel = async (): Promise<never> => {
  throw new Error('Ainda não disponível com a base de dados');
};

/** Instantes do PostgREST ("...+00:00", microssegundos) no mesmo formato ISO do modo local. */
export const iso = (valor: string | null) => (valor ? new Date(valor).toISOString() : null);
```

- [ ] E2.6.2 Sessão no Supabase (`supabase/sessao.ts`). O aviso de mudança de sessão roda fora do callback (`setTimeout`), porque chamar o Supabase dentro dele pode travar:

```ts
import type { RepositorioSessao } from '../contratos';
import { cliente, traduzirErro } from './comum';

export const sessaoSupabase: RepositorioSessao = {
  async sessaoAtual() {
    const { data } = await cliente().auth.getSession();
    const usuario = data.session?.user;
    if (!usuario) return null;
    const { data: linha, error } = await cliente().from('usuarios').select('papel, nome').eq('id', usuario.id).single();
    if (error) throw new Error(traduzirErro(error));
    return { usuarioId: usuario.id, papel: linha.papel, nome: linha.nome };
  },
  observar(aoMudar) {
    const { data } = cliente().auth.onAuthStateChange((evento) => {
      if (evento !== 'TOKEN_REFRESHED') setTimeout(aoMudar, 0);
    });
    return () => data.subscription.unsubscribe();
  },
  async cadastrar({ nome, email, senha, tcleVersao }) {
    const { error } = await cliente().auth.signUp({
      email, password: senha,
      options: { data: { nome, aceite_tcle: true, aceite_privacidade: true, maioridade: true, tcle_versao: tcleVersao } },
    });
    if (error) throw new Error(traduzirErro(error));
  },
  async entrar(email, senha) {
    const { error } = await cliente().auth.signInWithPassword({ email, password: senha });
    if (error) throw new Error(traduzirErro(error));
  },
  async entrarDemonstracao() {
    throw new Error('Os atalhos de demonstração existem só no modo local');
  },
  async sair() {
    await cliente().auth.signOut();
  },
  async pedirNovaSenha(email) {
    // A confirmação na tela é sempre a mesma, exista ou não a conta (PRD T04).
    await cliente().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/redefinir-senha` });
  },
  async definirNovaSenha(senha) {
    const { error } = await cliente().auth.updateUser({ password: senha });
    if (error) throw new Error(traduzirErro(error));
  },
};
```

- [ ] E2.6.3 `supabase/index.ts` monta `repositoriosSupabase: Repositorios` com `sessao: sessaoSupabase` e, por enquanto, os outros repositórios com `naoDisponivel` em cada método (o E2.7 troca por implementações reais). `src/dados/repositorios/index.ts` passa a escolher pelo `.env`:

```ts
import type { Repositorios } from './contratos';
import { repositoriosLocais } from './local';
import { repositoriosSupabase } from './supabase';

export const MODO_DADOS: 'local' | 'supabase' = import.meta.env.VITE_FONTE_DADOS === 'supabase' ? 'supabase' : 'local';
export const repositorios: Repositorios = MODO_DADOS === 'supabase' ? repositoriosSupabase : repositoriosLocais;
```

- [ ] E2.6.4 Recuperação de senha de verdade (o link do e-mail volta para o app):
  - `src/pages/publico/RedefinirSenha.tsx`, na rota `/redefinir-senha`, fora das regras de acesso (o link abre uma sessão de recuperação). Formulário com Nova senha e Confirmar senha (mínimo de 8, iguais); ao enviar, `definirNovaSenha`, toast "Senha alterada. Entre com a nova senha.", `sair()` e `navigate('/entrar')`. Erro de sessão: "O link expirou. Peça um novo em Esqueci minha senha." No modo local, a tela mostra só "A redefinição de senha funciona só com a base de dados." e o link para o login.
- [ ] E2.6.5 Itens só do modo local (PRD 8.8): na T03, o bloco "Atalhos de demonstração" aparece só com `MODO_DADOS === 'local'`; no `LayoutAdmin`, "Voltar ao app" também (no modo Supabase, o administrador não é jovem).

- [ ] E2.6.6 Testar no modo Supabase: no `.env`, `VITE_FONTE_DADOS=supabase` e reiniciar o `npm run dev`.

Conferir: `npm run lint`, `npm run build`; no navegador:
1. Criar uma conta (ex.: `teste1@exemplo.test`) com os três aceites: cai no pré-teste (que só funciona depois do E2.7). No Table Editor, a linha em `usuarios` tem as três datas de aceite.
2. Sair e entrar de novo; senha errada mostra "E-mail ou senha incorretos".
3. "Esqueci minha senha" com um e-mail real do grupo: chega o e-mail; o link abre `/redefinir-senha` e a nova senha funciona. (O Supabase limita os e-mails por hora no plano gratuito.)
4. Os atalhos de demonstração não aparecem.

O que o usuário faz: os testes acima. Para promover uma conta a administrador (depois de criá-la pelo app), rodar no SQL Editor:

```sql
update public.usuarios set papel = 'admin'
where id = (select id from auth.users where email = 'admin-teste@exemplo.test');
```

Commit sugerido: `feat: autenticação no Supabase e escolha do modo de dados`.

---

### E2.7 — App no Supabase: estudo, testes e simulações

Arquivos:
- Criar: `src/dados/repositorios/supabase/mapear.ts`, `supabase/usuario.ts`, `supabase/conteudo.ts`, `supabase/progresso.ts`, `supabase/quiz.ts`, `supabase/testes.ts`, `supabase/simulacoes.ts`, `supabase/notificacoes.ts`.
- Modificar: `supabase/index.ts`.

Tarefas:

- [ ] E2.7.1 Conversões de linha do banco para os tipos do app (`supabase/mapear.ts`). Ids numéricos viram texto; instantes passam por `iso`:

```ts
import type { BlocoConteudo, Licao, Notificacao, Progresso, RespostaQuiz, Simulacao, Usuario } from '@/dados/tipos';
import { iso } from './comum';

/* eslint-disable @typescript-eslint/no-explicit-any -- linhas cruas do PostgREST; o tipo final é o do app */
export const paraUsuario = (l: any, email: string): Usuario => ({
  id: l.id, nome: l.nome, email, papel: l.papel, xpTotal: l.xp_total, diasStreak: l.dias_streak, ultimoDiaUso: l.ultimo_dia_uso,
  ultimaAtividadeEm: iso(l.ultima_atividade_em), receberLembretes: l.receber_lembretes, tcleVersao: l.tcle_versao,
  tcleAceitoEm: iso(l.tcle_aceito_em), privacidadeAceitaEm: iso(l.privacidade_aceita_em),
  maioridadeDeclaradaEm: iso(l.maioridade_declarada_em), criadoEm: iso(l.criado_em)!,
});
export const paraLicao = (l: any): Licao => ({
  id: l.id, trilhaId: l.trilha_id, ordem: l.ordem, titulo: l.titulo, tempoLeituraMin: l.tempo_leitura_min, conteudo: l.conteudo as BlocoConteudo[],
});
export const paraProgresso = (l: any): Progresso => ({
  id: String(l.id), usuarioId: l.usuario_id, trilhaId: l.trilha_id, licaoId: l.licao_id, leituraConcluidaEm: iso(l.leitura_concluida_em),
  quizConcluidoEm: iso(l.quiz_concluido_em), acertos: l.acertos, xpGanho: l.xp_ganho, sincronizadoOffline: l.sincronizado_offline,
});
export const paraResposta = (l: any): RespostaQuiz => ({
  id: String(l.id), usuarioId: l.usuario_id, quizId: l.quiz_id, questaoId: l.questao_id, trilhaId: l.trilha_id, nivelQuestao: l.nivel_questao,
  alternativaMarcada: l.alternativa_marcada, acertou: l.acertou, xpGanho: l.xp_ganho, nivelTrilhaApos: l.nivel_trilha_apos, respondidaEm: iso(l.respondida_em)!,
});
export const paraSimulacao = (l: any): Simulacao => ({
  id: String(l.id), usuarioId: l.usuario_id, tipoSimulacao: l.tipo_simulacao, parametros: l.parametros, resultadoFinal: Number(l.resultado_final), criadaEm: iso(l.criada_em)!,
});
export const paraNotificacao = (l: any): Notificacao => ({
  id: String(l.id), usuarioId: l.usuario_id, tipo: l.tipo, mensagem: l.mensagem, link: l.link, dataEnvio: iso(l.data_envio)!, lida: l.lida,
});
/* eslint-enable @typescript-eslint/no-explicit-any */
```

Se os tipos do banco tiverem sido gerados no E2.5.3, trocar `any` pelos tipos `Database['public']['Tables'][...]['Row']` e remover as linhas do `eslint`.

- [ ] E2.7.2 Repositórios (cada método numa linha de consulta ou numa chamada de função; erro sempre com `throw new Error(traduzirErro(error))`):
  - `usuario`: `meuUsuario()` = `from('usuarios').select('*').eq('id', id).single()` com o e-mail de `auth.getSession()`, convertido por `paraUsuario`; `definirReceberLembretes(v)` = `update({ receber_lembretes: v }).eq('id', id)`.
  - `conteudo`: `trilhas` (`order('ordem')`), `licoes` (`order('trilha_id').order('ordem')`, com `paraLicao`), `quizzes` e `badges` (`order('ordem')`), convertendo para os tipos do app.
  - `progresso`: `meusProgressos()` e `minhasRespostas()` com `select` das próprias linhas (a RLS já filtra; o `.eq('usuario_id', id)` deixa a consulta explícita); `concluirLeitura(id)` = `rpc('concluir_leitura', { p_licao_id: id })`; `sincronizarPendentes()` devolve `0` (no modo Supabase não há fila offline).
  - `quiz`: `proximaQuestao(quizId)` = `rpc('proxima_questao', { p_quiz_id: quizId })` (o JSON já vem no formato de `QuestaoPublica`); `responder(...)` = `rpc('responder_questao', { p_quiz_id, p_questao_id, p_alternativa })` (formato de `ResultadoResposta`).
  - `testes`: `meusTestes()` = `rpc('meus_testes')`; `iniciar(tipo)` = `rpc('iniciar_teste', { p_tipo: tipo })` (devolve `resumo`, `perguntas` e `respondidas`); `responder(...)` = `rpc('registrar_resposta_teste', { p_tipo, p_pergunta_id, p_alternativa })`.
  - `simulacoes`: `minhasSimulacoes()` = `select('*').order('criada_em', { ascending: false }).limit(10)` com `paraSimulacao`; `salvar(s)` = `insert({ tipo_simulacao, parametros, resultado_final })` (o `usuario_id` vem do padrão `auth.uid()`).
  - `notificacoes.minhasNotificacoes()` = `select('*').order('data_envio', { ascending: false })` com `paraNotificacao` (os outros métodos de notificações entram no contrato só no passo 20).

- [ ] E2.7.3 Em `supabase/index.ts`, trocar os `naoDisponivel` por esses repositórios.

Conferir de ponta a ponta no modo Supabase, com uma conta nova (ex.: `teste2@exemplo.test`):
1. Pré-teste: as 3 perguntas; depois as trilhas abrem. No SQL Editor: `select pseudonimo, tipo_teste, forma, versao, pontuacao_total, concluido_em from public.testes_diagnosticos;` mostra o pseudônimo `P-` com 8 caracteres e nenhum nome ou e-mail; `select * from public.respostas_teste;` mostra 3 linhas com data e hora.
2. Orçamento Pessoal → Lição 1 → quiz: as 3 questões vêm com a etiqueta Médio. Acertar as 3: +60 XP; conquistas Primeiro Quiz e Gabaritou.
3. Lição 2 → quiz: acertar as duas primeiras (Médio); depois da segunda aparece "Mandou bem!" e a terceira é Difícil. Acertar: +75 XP (total 135); conquista Desafio Aceito.
4. No SQL Editor: `select questao_id, nivel_questao, acertou, xp_ganho, nivel_trilha_apos from public.respostas_quiz order by respondida_em;` mostra `nivel_trilha_apos` = médio nas 4 primeiras e difícil nas 2 últimas; `select xp_total, dias_streak from public.usuarios;` mostra 135 e 1.
5. Simuladores: a simulação feita aparece em "Últimas simulações" e em `public.simulacoes`.
6. Com uma segunda conta, nada da primeira aparece. Opcional, no SQL Editor (trocar o id pelo da conta B):

```sql
begin;
select set_config('request.jwt.claims', json_build_object('sub', '<id-da-conta-B>', 'role', 'authenticated')::text, true);
set local role authenticated;
select count(*) from public.respostas_quiz;      -- só as da conta B
select count(*) from public.testes_diagnosticos; -- erro "permission denied": sem acesso direto
rollback;
```

O que o usuário faz: o roteiro acima e, se quiser, publicar com `npm run deploy` (lembrando de pôr a URL do Worker nas Redirect URLs do E2.1.1). Para voltar ao modo da apresentação, `VITE_FONTE_DADOS=local`.

Commit sugerido: `feat: estudo, testes e simulações gravando no Supabase`.

---
## Passo 13 — T06 Pós-teste e os testes no Perfil (Importante)

Ler antes: PRD 2.2 (T06), 2.3 (card do teste final) e 2.11 (Meus testes).

Arquivos:
- Criar: `src/pages/jovem/PosTeste.tsx`, `src/components/ResumoTestes.tsx`, `src/components/CardTesteFinal.tsx`.
- Modificar: `src/pages/jovem/Inicio.tsx`, a tela provisória de `/perfil` (do passo 6), `src/app/rotas.tsx`.

Parte local:

- [ ] 13.1 Estado do pós-teste, calculado na tela a partir de `useMeusTestes()`, `useProgressos()` e, no modo local, `lerAparelho().posTesteLiberadoDemo`:
  - concluído: o resumo `pos` tem `concluidoEm`;
  - liberado: `trilhasConcluidas(progressos) === 4`;
  - liberado por demonstração: `posTesteLiberadoDemo` (só no modo local);
  - bloqueado: nos outros casos.
- [ ] 13.2 T06 (`/pos-teste`, modo foco), reaproveitando `PerguntaTeste` (passo 12):
  - bloqueado: "Conclua as 4 trilhas para liberar o teste final", "N de 4 trilhas concluídas" com `Progress` e o botão Ver trilhas;
  - liberado: introdução no formato do pré-teste com o título "Teste final"; com o selo "Liberado pela ferramenta de demonstração" quando for o caso;
  - perguntas da Forma B (`useIniciarTeste('pos')`, `useResponderPergunta('pos', ...)`), retomando a próxima sem resposta;
  - resultado (também quando o pós já estava concluído): "Teste inicial: x de 3 (y%)" e a data; "Teste final: x de 3 (y%)" e a data (`percentualDeAcerto`, `formatarPercentualInteiro`, `formatarData`); "Diferença: {formatarPontosPercentuais(diferencaPp(pre, pos, 3))}"; duas barras horizontais simples (largura proporcional ao percentual, com o número escrito); o texto "Este número mostra a sua evolução entre os dois testes."; o botão Voltar ao início. Nada de respostas corretas nem XP.
- [ ] 13.3 `src/components/ResumoTestes.tsx` (usado no Perfil): teste inicial com nota, percentual e data; teste final bloqueado ("Liberado depois das 4 trilhas: N de 4"), liberado (botão Fazer agora) ou concluído (nota, percentual e a diferença). Entra já na tela provisória de `/perfil`, acima do botão Sair.
- [ ] 13.4 `src/components/CardTesteFinal.tsx`: o 5º card do Início (PRD T07), com os mesmos três estados.

Parte Supabase: nada novo no banco (a função `iniciar_teste('pos')` do E2.5 já exige o pré-teste e as 4 trilhas). Conferir no modo Supabase que a tela mostra o bloqueio com "N de 4 trilhas concluídas".

Conferir: `npm run lint`, `npm run build`; critérios de T06 e critério 5 de T07.

O que o usuário testa (modo local):
1. Como jovem principal, `/pos-teste` mostra o bloqueio com "1 de 4 trilhas concluídas"; o card do Início mostra o mesmo.
2. A liberação por demonstração entra no passo 16; até lá, testar com uma conta que conclua as 4 trilhas, ou adiar este teste para o passo 16.
3. Depois de concluir: 33% → 100% dá "+67 p.p."; abrir `/pos-teste` de novo mostra só o resultado.

Commit sugerido: `feat: pós-teste com comparação pré e pós (RF05)`.

---

## Passo 14 — Conquistas: regras, T17 e o modal (Importante)

Ler antes: PRD 2.10 (Conquistas e T17), 2.5 (T12, critérios 2 e 3) e 2.3 (card da próxima conquista).

Arquivos:
- Criar: `src/dados/repositorios/local/conquistas.ts`, `src/dados/repositorios/supabase/conquistas.ts`, `src/hooks/dados/useConquistas.ts`, `src/components/IconeConquista.tsx`, `src/components/ModalConquista.tsx`, `src/components/CardProximaConquista.tsx`, `src/pages/jovem/Conquistas.tsx`.
- Modificar: `src/regras/gamificacao.ts`, `src/regras/gamificacao.test.ts`, `local/quiz.ts`, `contratos.ts`, `local/index.ts`, `supabase/index.ts`, `src/pages/jovem/ResultadoQuiz.tsx`, `src/pages/jovem/Inicio.tsx`, `src/app/rotas.tsx`.

Parte local:

- [ ] 14.1 Testes (acrescentar em `src/regras/gamificacao.test.ts`):

```ts
import { proximaConquista, verificarConquistas, type SituacaoConquistas } from './gamificacao';
import { BADGES } from '@/dados/demo/badges';

const base: SituacaoConquistas = {
  quizzesConcluidos: 1, trilhasConcluidas: 0, maiorNumeroDeLicoesNumaTrilha: 1, sequenciaDias: 1,
  acertosNoQuiz: 2, questoesNoQuiz: 3, chegouAoDificil: false, jaConquistadas: [],
};

describe('conquistas (RF08)', () => {
  it('RF08: cada critério', () => {
    expect(verificarConquistas(base)).toEqual(['primeiro_quiz']);
    expect(verificarConquistas({ ...base, acertosNoQuiz: 3 })).toEqual(['primeiro_quiz', 'gabaritou']);
    expect(verificarConquistas({ ...base, sequenciaDias: 7 })).toEqual(['primeiro_quiz', 'sequencia_7_dias']);
    expect(verificarConquistas({ ...base, chegouAoDificil: true })).toEqual(['primeiro_quiz', 'desafio_aceito']);
    expect(verificarConquistas({ ...base, trilhasConcluidas: 4 })).toEqual(['primeiro_quiz', 'primeira_trilha', 'mestre_das_financas']);
  });
  it('RF08: nunca duplica', () => {
    expect(verificarConquistas({ ...base, acertosNoQuiz: 3, jaConquistadas: ['primeiro_quiz', 'gabaritou'] })).toEqual([]);
  });
  it('próxima conquista: a primeira bloqueada na ordem da lista, com o progresso', () => {
    const p = proximaConquista(BADGES, ['primeiro_quiz', 'primeira_trilha'], { ...base, sequenciaDias: 4 });
    expect(p).toEqual({ badge: BADGES[2], progresso: '4 de 7 dias' });
  });
});
```

- [ ] 14.2 Implementar em `src/regras/gamificacao.ts`:

```ts
import type { Badge, CodigoBadge } from '@/dados/tipos';

export interface SituacaoConquistas {
  quizzesConcluidos: number;
  trilhasConcluidas: number;
  maiorNumeroDeLicoesNumaTrilha: number;
  sequenciaDias: number;
  acertosNoQuiz: number;
  questoesNoQuiz: number;
  chegouAoDificil: boolean; // o nível da trilha (estado do motor) chegou a Difícil
  jaConquistadas: CodigoBadge[];
}

/** RF08: conquistas novas ao concluir um quiz, na ordem da lista, sem repetir. */
export function verificarConquistas(s: SituacaoConquistas): CodigoBadge[] {
  const regras: [CodigoBadge, boolean][] = [
    ['primeiro_quiz', s.quizzesConcluidos >= 1],
    ['primeira_trilha', s.trilhasConcluidas >= 1],
    ['sequencia_7_dias', s.sequenciaDias >= 7],
    ['gabaritou', s.questoesNoQuiz > 0 && s.acertosNoQuiz === s.questoesNoQuiz],
    ['desafio_aceito', s.chegouAoDificil],
    ['mestre_das_financas', s.trilhasConcluidas >= 4],
  ];
  return regras.filter(([codigo, ok]) => ok && !s.jaConquistadas.includes(codigo)).map(([codigo]) => codigo);
}

/** Card do Início (PRD T07): a primeira conquista bloqueada na ordem da lista. */
export function proximaConquista(badges: Badge[], conquistadas: CodigoBadge[], s: SituacaoConquistas): { badge: Badge; progresso: string | null } | null {
  const badge = [...badges].sort((a, b) => a.ordem - b.ordem).find((b) => !conquistadas.includes(b.id));
  if (!badge) return null;
  const progresso: Partial<Record<CodigoBadge, string>> = {
    primeira_trilha: `${s.maiorNumeroDeLicoesNumaTrilha} de 3 lições`,
    sequencia_7_dias: `${Math.min(s.sequenciaDias, 7)} de 7 dias`,
    mestre_das_financas: `${s.trilhasConcluidas} de 4 trilhas`,
  };
  return { badge, progresso: progresso[badge.id] ?? null };
}
```

- [ ] 14.3 Conceder no quiz local. Em `local/quiz.ts`, dentro do bloco `if (quizConcluido)`, depois de `registrarAtividade`, trocar `conquistasNovas: []` pelo resultado de:

```ts
const meusProgressos = banco.progressos.filter((p) => p.usuarioId === usuarioId);
const usuario = banco.usuarios.find((u) => u.id === usuarioId)!;
const concluidasPorTrilha = TRILHAS.map((t) => meusProgressos.filter((p) => p.trilhaId === t.id && p.quizConcluidoEm).length);
conquistasNovas = verificarConquistas({
  quizzesConcluidos: meusProgressos.filter((p) => p.quizConcluidoEm).length,
  trilhasConcluidas: trilhasConcluidas(meusProgressos),
  maiorNumeroDeLicoesNumaTrilha: Math.max(...concluidasPorTrilha),
  sequenciaDias: usuario.diasStreak,
  acertosNoQuiz, questoesNoQuiz: quiz.numeroQuestoes,
  chegouAoDificil: banco.respostasQuiz.some((r) => r.usuarioId === usuarioId && r.nivelTrilhaApos === 'dificil'),
  jaConquistadas: banco.usuarioBadges.filter((b) => b.usuarioId === usuarioId).map((b) => b.badgeId),
});
for (const codigo of conquistasNovas) {
  banco.usuarioBadges.push({ usuarioId, badgeId: codigo, conquistadoEm: instante.toISOString() });
  banco.notificacoes.push({ id: crypto.randomUUID(), usuarioId, tipo: 'conquista', mensagem: `Você ganhou a conquista ${BADGES.find((b) => b.id === codigo)!.nome}!`, link: '/conquistas', dataEnvio: instante.toISOString(), lida: false });
}
if (conquistasNovas.includes('mestre_das_financas')) {
  banco.notificacoes.push({ id: crypto.randomUUID(), usuarioId, tipo: 'sistema', mensagem: 'Teste final liberado! Faça agora para ver a sua evolução.', link: '/pos-teste', dataEnvio: instante.toISOString(), lida: false });
}
```

(`conquistasNovas` vira `let conquistasNovas: CodigoBadge[] = []` antes do `if`; importar `TRILHAS`, `BADGES`, `verificarConquistas` e `trilhasConcluidas`.) É a mesma regra da função `privado.conceder_conquistas` do E2.5.

- [ ] 14.4 Repositório `conquistas.minhasConquistas()` local (as do usuário da sessão) e hook `useConquistas()`.
- [ ] 14.5 `IconeConquista`: mapa do nome do ícone (`CircleCheck`, `Flag`, `Flame`, `Target`, `Mountain`, `Crown`) para o componente do `lucide-react`; se o nome não existir, usa `Award` (PRD: ícone padrão se falhar).
- [ ] 14.6 `ModalConquista`: `Dialog` com o título "Conquista desbloqueada!", a lista das conquistas novas (ícone em `text-xp-icone`, nome e "Conquistada em dd/mm/aaaa"), a `Celebracao` e o botão Continuar. Na T12, abre uma vez quando `resultado.conquistasNovas` não estiver vazio, e a tela lista as mesmas conquistas em destaque.
- [ ] 14.7 T17 (`/conquistas`): "N de 6 conquistas"; grade de 2 colunas; obtidas com ícone em âmbar, nome e data; bloqueadas com ícone cinza, `Lock`, "Bloqueada", o critério e o progresso (mesmos textos de `proximaConquista`).
- [ ] 14.8 `CardProximaConquista` no Início (4º card, metade esquerda), com link para `/conquistas`.

Parte Supabase:

- [ ] 14.9 `supabase/conquistas.ts`: `minhasConquistas()` = `from('usuario_badges').select('usuario_id, badge_id, conquistado_em')`, convertido para `UsuarioBadge` (instante com `iso`). A concessão já acontece no servidor (E2.5).

Conferir: `npm run test`, `npm run lint`, `npm run build`; critérios de T17 e os critérios 2 e 3 de T12.

O que o usuário testa (modo local, depois de "Reiniciar dados" ou com os dados de demonstração):
1. `/conquistas`: Primeiro Quiz e Primeira Trilha coloridas e com data; as outras 4 bloqueadas, com critério e "4 de 7 dias".
2. Quiz da lição 2 de Juros Compostos com 3 acertos: o modal mostra Gabaritou e Desafio Aceito; o sino ganha 2 notificações.
3. Refazer não é possível; nenhuma conquista aparece duas vezes.
4. Modo Supabase: com a conta do E2.7, `/conquistas` mostra as conquistas dela.

Commit sugerido: `feat: conquistas com modal e próxima conquista (RF08)`.

---

## Passo 15 — T16 Ranking (Importante)

Ler antes: PRD 2.9; decisões 3 e 5 da 7.5.

Arquivos:
- Criar: `src/dados/repositorios/local/ranking.ts`, `src/dados/repositorios/supabase/ranking.ts`, `src/hooks/dados/useRanking.ts`, `src/components/SeloDados.tsx`, `src/components/CardPosicaoRanking.tsx`, `src/pages/jovem/Ranking.tsx`, `supabase/migrations/20261101120500_ranking.sql`.
- Modificar: `src/regras/gamificacao.ts`, `src/regras/gamificacao.test.ts`, `contratos.ts`, `local/index.ts`, `supabase/index.ts`, `src/pages/jovem/Inicio.tsx`, `src/app/rotas.tsx`.

Parte local:

- [ ] 15.1 Testes (acrescentar em `gamificacao.test.ts`):

```ts
import { montarRanking, nomeDeExibicao, xpDaSemana } from './gamificacao';
import { criarDadosDemo } from '@/dados/demo';
import { ID_ALEX } from '@/dados/demo/usuarios';

describe('ranking (RF07, RNF04)', () => {
  it('nome de exibição: primeiro nome e inicial do último sobrenome', () => {
    expect(nomeDeExibicao('Bruna Moreira')).toBe('Bruna M.');
    expect(nomeDeExibicao('Ana Clara de Souza')).toBe('Ana S.');
    expect(nomeDeExibicao('Alex')).toBe('Alex');
  });
  it('RF07: ordem por XP; empate na mesma posição (1, 2, 2, 4), em ordem alfabética', () => {
    const r = montarRanking([
      { usuarioId: 'a', nome: 'Zé Silva', xp: 50 }, { usuarioId: 'b', nome: 'Ana Lima', xp: 50 },
      { usuarioId: 'c', nome: 'Bia Reis', xp: 90 }, { usuarioId: 'd', nome: 'Caio Melo', xp: 10 },
    ], 'b');
    expect(r.map((l) => [l.posicao, l.nomeExibicao, l.xp, l.ehVoce])).toEqual([
      [1, 'Bia R.', 90, false], [2, 'Ana L.', 50, true], [2, 'Zé S.', 50, false], [4, 'Caio M.', 10, false],
    ]);
  });
  it('RF07: com os dados de demonstração, Alex em 7º com 120 XP; com +75 XP, 6º', () => {
    const banco = criarDadosDemo(new Date('2026-11-04T15:00:00Z'));
    const jovens = banco.usuarios.filter((u) => u.papel === 'jovem').map((u) => ({ usuarioId: u.id, nome: u.nome, xp: u.xpTotal }));
    expect(montarRanking(jovens, ID_ALEX).find((l) => l.ehVoce)).toMatchObject({ posicao: 7, xp: 120 });
    const depois = jovens.map((j) => (j.usuarioId === ID_ALEX ? { ...j, xp: 195 } : j));
    expect(montarRanking(depois, ID_ALEX).find((l) => l.ehVoce)).toMatchObject({ posicao: 6, xp: 195 });
  });
  it('esta semana: de segunda 00h00 em São Paulo até agora', () => {
    const agora = new Date('2026-11-04T15:00:00Z');
    const respostas = [
      { xpGanho: 20, respondidaEm: '2026-11-02T03:00:00.000Z' }, // segunda 00h00 em SP: conta
      { xpGanho: 35, respondidaEm: '2026-11-02T02:59:00.000Z' }, // domingo 23h59 em SP: não conta
    ];
    expect(xpDaSemana(respostas, agora)).toBe(20);
  });
});
```

- [ ] 15.2 Implementar em `gamificacao.ts`:

```ts
import { inicioDaSemana } from '@/lib/fuso';
import type { LinhaRanking } from '@/dados/tipos';

export function nomeDeExibicao(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return partes.length === 1 ? partes[0] : `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.`;
}

export interface EntradaRanking { usuarioId: string; nome: string; xp: number }

/** RF07: ordena por XP; empate fica na mesma posição e em ordem alfabética. Só nome de exibição e XP saem daqui (RNF04). */
export function montarRanking(entradas: EntradaRanking[], meuId: string | null): LinhaRanking[] {
  const ordenadas = [...entradas].sort((a, b) => b.xp - a.xp || nomeDeExibicao(a.nome).localeCompare(nomeDeExibicao(b.nome), 'pt-BR'));
  let posicao = 0;
  return ordenadas.map((e, i) => {
    if (i === 0 || e.xp !== ordenadas[i - 1].xp) posicao = i + 1;
    return { posicao, nomeExibicao: nomeDeExibicao(e.nome), xp: e.xp, ehVoce: e.usuarioId === meuId };
  });
}

export function xpDaSemana(respostas: { xpGanho: number; respondidaEm: string }[], agora: Date): number {
  const inicio = inicioDaSemana(agora).getTime();
  return respostas.filter((r) => Date.parse(r.respondidaEm) >= inicio).reduce((soma, r) => soma + r.xpGanho, 0);
}
```

- [ ] 15.3 `local/ranking.ts`: só jovens; XP geral = `xpTotal`; XP da semana = `xpSemanaFicticio` quando existir (os 11 fictícios), senão `xpDaSemana(respostas do usuário, agora())`; `montarRanking(..., usuarioDaSessao())`.
- [ ] 15.4 `SeloDados`: no modo local, "Dados de demonstração (fictícios)" (variante `admin`) ou "Participantes fictícios (demonstração)" (variante `ranking`); no modo Supabase, "Contas de teste (projeto de desenvolvimento)" nas duas.
- [ ] 15.5 T16 (`/ranking`):
  - `ToggleGroup` Geral / Esta semana (`useRanking(periodo)`, chave `['ranking', periodo]`);
  - subtítulo com `SeloDados variante="ranking"`;
  - lista: posição, nome de exibição e XP (`tabular-nums`); top 3 com `Medal` e "1º", "2º", "3º" e fundo suave; a linha do jovem com destaque e "(você)";
  - linha do jovem fixa no rodapé quando sair da área visível (`IntersectionObserver` na linha original);
  - "Atualizado às HH:MM" com `formatarHora(new Date(consulta.dataUpdatedAt))`; offline, a última classificação continua (cache do TanStack Query) com o mesmo horário;
  - troca de posição animada (FLIP com `useLayoutEffect`: guardar a posição de cada linha antes da atualização e animar o `transform` até zero em 250 ms; o CSS global já tira a animação com menos movimento).
- [ ] 15.6 `CardPosicaoRanking` no Início (4º card, metade direita): "7º lugar de 12", com link para `/ranking`.

Parte Supabase:

- [ ] 15.7 `supabase/migrations/20261101120500_ranking.sql`:

```sql
-- RF07 e RNF04: ranking só com nome de exibição e XP (geral ou da semana, de segunda a domingo em São Paulo).
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
```

Explicação para o usuário: a função monta o ranking no servidor e devolve só posição, nome de exibição, XP e se a linha é de quem pediu; nenhum id, e-mail ou outro dado sai.

- [ ] 15.8 `supabase/ranking.ts`: `rpc('ranking', { p_periodo: periodo })`, convertendo para `LinhaRanking` (`Number` em `posicao` e `xp`).

Conferir: `npm run test`, `npm run lint`, `npm run build`; critérios de T16 e critério 4 de T07.

O que o usuário testa:
1. Modo local: 12 jovens, Alex L. em 7º com 120 XP; depois do quiz do roteiro, 6º com 195 XP, sem recarregar, e o horário muda.
2. Rolando a lista, a linha do Alex fica fixa no rodapé.
3. "Esta semana" usa só o XP da semana.
4. Modo Supabase: rodar o SQL; o ranking mostra as contas de teste, com o selo "Contas de teste (projeto de desenvolvimento)".

Commit sugerido: `feat: ranking geral e semanal com só nome e XP (RF07, RNF04)`.

---

## Passo 16 — T19 Perfil completo e as ferramentas de demonstração (Essencial: Sair e termos; apoio à demonstração)

Ler antes: PRD 2.11 (T19 e Ferramentas de demonstração), 6.9.

Arquivos:
- Criar: `src/dados/repositorios/local/demonstracao.ts`, `src/dados/repositorios/supabase/demonstracao.ts`, `src/components/FerramentasDemonstracao.tsx`, `src/components/AvisoRelogioSimulado.tsx`, `src/pages/jovem/Perfil.tsx`.
- Modificar: `contratos.ts`, `local/index.ts`, `supabase/index.ts`, `src/components/TopoJovem.tsx`, `src/layouts/LayoutAdmin.tsx`, `src/app/rotas.tsx`.

Parte local:

- [ ] 16.1 `local/demonstracao.ts`:

```ts
import { atualizarAparelho } from '@/dados/aparelho';
import { carregarBanco, reiniciarBanco } from '@/dados/bancoLocal';
import { avancarRelogio, zerarRelogio } from '@/lib/relogio';
import type { RepositorioDemonstracao } from '../contratos';
import { parametrosAtuaisLocal, responder } from './comum';

export const demonstracaoLocal: RepositorioDemonstracao = {
  disponivel: true,
  limiteDeInatividade: () => responder(parametrosAtuaisLocal(carregarBanco()).limite_inatividade_horas),
  async avancarRelogio(horas) {
    avancarRelogio(horas);
    await responder(null);
  },
  async liberarPosTeste() {
    atualizarAparelho({ posTesteLiberadoDemo: true });
    await responder(null);
  },
  async reiniciar() {
    zerarRelogio();
    atualizarAparelho({ posTesteLiberadoDemo: false });
    reiniciarBanco();
    await responder(null);
  },
};
```

`supabase/demonstracao.ts`: `disponivel: false` e os métodos com `naoDisponivel`.

- [ ] 16.2 `FerramentasDemonstracao` (só aparece com `repositorios.demonstracao.disponivel`): caixa com borda tracejada e o aviso "Só para a apresentação do TCC — dados fictícios"; botões:
  - "Entrar como administrador" (no jovem) ou "Entrar como jovem" (no administrador): `entrarDemonstracao(...)` e navegar para `/admin` ou `/inicio`;
  - "Simular {limite} h sem acesso" (rótulo com `limiteDeInatividade()`): `avancarRelogio(limite)` e o toast "Relógio avançado em {limite} h (simulação)";
  - "Liberar o pós-teste": `liberarPosTeste()` e o toast "Teste final liberado (demonstração)";
  - "Reiniciar dados de demonstração": `AlertDialog` com "Isso apaga o progresso feito neste aparelho e restaura os dados fictícios. Continuar?"; ao confirmar, `reiniciar()`, `entrarDemonstracao` do papel atual e invalidar todas as consultas.
- [ ] 16.3 `AvisoRelogioSimulado`: quando o deslocamento do relógio não for zero, um selo discreto "Relógio simulado: +48 h" no topo do jovem e do administrador.
- [ ] 16.4 T19 (`/perfil`), substituindo a tela provisória:
  - cabeçalho: círculo com as iniciais, nome, e-mail e "No app desde dd/mm/aaaa";
  - resumo: XP, sequência e "N de 6 conquistas" com o link Ver conquistas;
  - Meus testes: `ResumoTestes` (passo 13);
  - Preferências: `Switch` "Receber lembretes" (`usuario.definirReceberLembretes`) e `Switch` "Tema escuro" (`definirTema`);
  - Termos: "Ler o TCLE" e "Política de privacidade" (`ModalTermo` com `aceitoEm` = `tcleAceitoEm` e `privacidadeAceitaEm`);
  - `FerramentasDemonstracao`;
  - botão Sair.
- [ ] 16.5 No `LayoutAdmin`, o botão "Ferramentas de demonstração" abre um `Dialog` com o mesmo componente (só no modo local).

Parte Supabase: `definirReceberLembretes` já existe (E2.7). As ferramentas não aparecem (PRD 8.8).

Conferir: `npm run lint`, `npm run build`; critérios de T19 (o item do lembrete, no critério 5, depende do passo 20).

O que o usuário testa (modo local):
1. Perfil com nome, e-mail, data, XP, sequência, conquistas e os testes.
2. Tema escuro muda na hora e continua depois de recarregar; "Receber lembretes" também continua.
3. "Simular 48 h sem acesso": a sequência vai a 0 na hora e aparece "Relógio simulado: +48 h".
4. "Liberar o pós-teste": o card do Início e o `/pos-teste` ficam liberados (agora dá para testar o passo 13 inteiro).
5. "Reiniciar dados de demonstração": volta a 120 XP, 7º lugar e sequência de 4 dias.
6. Sair encerra a sessão.

Commit sugerido: `feat: perfil completo e ferramentas de demonstração`.

---

## Passo 17 — Área do administrador e T20 Visão geral (Importante)

Ler antes: PRD 2.12 (layout comum e T20), 3; decisão 8 da 7.5; instruções do projeto (Pesquisa e privacidade).

Arquivos:
- Criar: `src/dados/repositorios/local/admin.ts`, `src/dados/repositorios/supabase/admin.ts`, `src/hooks/dados/useAdmin.ts`, `src/pages/admin/VisaoGeral.tsx`, `supabase/migrations/20261101120600_admin_pesquisa.sql`.
- Modificar: `src/regras/pesquisa.ts`, `src/regras/pesquisa.test.ts`, `contratos.ts`, `local/index.ts`, `supabase/index.ts`, `src/layouts/LayoutAdmin.tsx`, `src/app/rotas.tsx`.

Parte local:

- [ ] 17.1 Teste das métricas (acrescentar em `pesquisa.test.ts`), com os dados fictícios do PRD 6.7:

```ts
import { calcularMetricas } from './pesquisa';
import { criarDadosDemo } from '@/dados/demo';
import { PERGUNTAS_DIAGNOSTICAS } from '@/dados/demo/perguntasDiagnosticas';

describe('métricas da pesquisa (RF12)', () => {
  const banco = criarDadosDemo(new Date('2026-11-04T15:00:00Z'));
  const m = calcularMetricas({ participantes: 12, testes: banco.testes, respostas: banco.respostasTeste, perguntas: PERGUNTAS_DIAGNOSTICAS });

  it('RF12: contagens e ganho observado médio só de quem fez os dois testes', () => {
    expect(m).toMatchObject({ participantes: 12, preConcluidos: 12, posConcluidos: 5, nPares: 5 });
    expect(m.ganhoMedio).toBeCloseTo(26.667, 3);
  });
  it('RF12: acerto por pergunta, só dos pares', () => {
    expect(m.porPergunta.map((p) => [p.numero, Math.round(p.pre), Math.round(p.pos)])).toEqual([[1, 80, 100], [2, 60, 60], [3, 20, 80]]);
  });
  it('RNF06: a tabela só tem pseudônimos', () => {
    expect(m.participantesTabela).toHaveLength(12);
    expect(m.participantesTabela.every((p) => /^P-[0-9A-F]{4,8}$/.test(p.pseudonimo))).toBe(true);
  });
});
```

- [ ] 17.2 Implementar em `pesquisa.ts`:

```ts
import type { MetricasPesquisa, PerguntaDiagnostica, RespostaTeste, TesteDiagnostico, TipoTeste } from '@/dados/tipos';

export function calcularMetricas(e: { participantes: number; testes: TesteDiagnostico[]; respostas: RespostaTeste[]; perguntas: PerguntaDiagnostica[] }): MetricasPesquisa {
  const concluidos = e.testes.filter((t) => t.concluidoEm);
  const pre = new Map(concluidos.filter((t) => t.tipoTeste === 'pre').map((t) => [t.pseudonimo, t]));
  const pos = new Map(concluidos.filter((t) => t.tipoTeste === 'pos').map((t) => [t.pseudonimo, t]));
  const pares = [...pre.keys()].filter((p) => pos.has(p));
  const perguntasPorForma = e.perguntas.filter((p) => p.forma === 'A').length;
  const ganhos = pares.map((p) => diferencaPp(pre.get(p)!.pontuacaoTotal!, pos.get(p)!.pontuacaoTotal!, perguntasPorForma));
  const numeroDaPergunta = new Map(e.perguntas.map((p) => [p.id, p.numero]));
  const tipoDoTeste = new Map(concluidos.map((t) => [t.id, t.tipoTeste]));
  const testesDosPares = new Set(pares.flatMap((p) => [pre.get(p)!.id, pos.get(p)!.id]));
  const porPergunta = [1, 2, 3].map((numero) => {
    const daPergunta = e.respostas.filter((r) => testesDosPares.has(r.testeId) && numeroDaPergunta.get(r.perguntaId) === numero);
    const taxa = (tipo: TipoTeste) => {
      const doTipo = daPergunta.filter((r) => tipoDoTeste.get(r.testeId) === tipo);
      return doTipo.length ? (doTipo.filter((r) => r.acertou).length / doTipo.length) * 100 : 0;
    };
    return { numero, pre: taxa('pre'), pos: taxa('pos') };
  });
  const pseudonimos = [...new Set(concluidos.map((t) => t.pseudonimo))].sort();
  return {
    participantes: e.participantes,
    preConcluidos: pre.size,
    posConcluidos: pos.size,
    nPares: pares.length,
    ganhoMedio: ganhos.length ? ganhos.reduce((s, g) => s + g, 0) / ganhos.length : null,
    porPergunta,
    participantesTabela: pseudonimos.map((p) => ({
      pseudonimo: p, preData: pre.get(p)?.concluidoEm ?? null, preNota: pre.get(p)?.pontuacaoTotal ?? null,
      posData: pos.get(p)?.concluidoEm ?? null, posNota: pos.get(p)?.pontuacaoTotal ?? null,
    })),
  };
}
```

- [ ] 17.3 `local/admin.ts`, primeira parte: um `exigirAdmin()` (o usuário da sessão precisa ter papel `admin`; senão, "Área restrita ao administrador") e `metricasPesquisa()` com `participantes` = número de jovens. Os outros métodos de `RepositorioAdmin` entram nos passos 18, 19 e 21.
- [ ] 17.4 T20 (`/admin`, rota com `lazy`):
  - título e `SeloDados variante="admin"`;
  - linha 1: quatro `Card` (Participantes; Pré-testes concluídos; Pós-testes concluídos; Ganho observado médio com `formatarPontosPercentuais(ganho, 1)` e "n = N" abaixo, ou "—");
  - linha 2: `BarChart` agrupado do Recharts (P1, P2, P3; séries "Pré-teste (Forma A)" e "Pós-teste (Forma B)"; eixo de 0% a 100%; rótulo com o valor em cada barra) e o título "Acerto por pergunta — participantes com os dois testes (n = N)"; sem pares, a mensagem do PRD;
  - linha 3: `Table` com Pseudônimo, Data do pré, Nota do pré ("2/3 (67%)"), Data do pós e Nota do pós ("—" quando faltar);
  - rodapé: "Sem grupo de controle: o número mostra o ganho observado, não o efeito do aplicativo."
- [ ] 17.5 `LayoutAdmin`: título da página e `SeloDados` no topo de todas as páginas do administrador.

Parte Supabase:

- [ ] 17.6 `supabase/migrations/20261101120600_admin_pesquisa.sql` (inclui a exportação, usada no passo 19):

```sql
-- RF12 e RNF06: métricas e exportação da pesquisa, só para o administrador e só com o pseudônimo.

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
```

Explicação para o usuário: as duas funções só respondem a quem tem papel de administrador e só trabalham com o pseudônimo; nome e e-mail não entram em nenhuma delas.

- [ ] 17.7 `supabase/admin.ts`: `metricasPesquisa()` = `rpc('metricas_pesquisa')`, com os instantes passando por `iso` (o contrato do administrador cresce nos passos 18, 19 e 21, nos dois modos).

Conferir: `npm run test`, `npm run lint`, `npm run build`; critérios de T20.

O que o usuário testa:
1. Modo local, "Entrar como administrador": selo fictício; 12 participantes, 12 pré, 5 pós e "+26,7 p.p. — n = 5"; gráfico com P1 80% → 100%, P2 60% → 60%, P3 20% → 80%; tabela só com pseudônimos.
2. Como jovem, liberar e fazer o pós-teste (passo 16); voltar como administrador: os números mudam.
3. Modo Supabase: rodar o SQL e promover uma conta a administrador (comando do E2.6); a visão geral mostra as contas de teste.

Commit sugerido: `feat: visão geral da pesquisa para o administrador (RF12)`.

---

## Passo 18 — T21 Banco de questões (Importante)

Ler antes: PRD 2.12 (T21); decisões 9 e 10 da 7.5.

Arquivos:
- Criar: `src/regras/bancoQuestoes.ts`, `src/regras/bancoQuestoes.test.ts`, `src/pages/admin/esquemaQuestao.ts`, `src/pages/admin/BancoQuestoes.tsx`, `supabase/migrations/20261101120700_admin_questoes.sql`.
- Modificar: `local/admin.ts`, `supabase/admin.ts`, `src/app/rotas.tsx`.

Parte local:

- [ ] 18.1 Teste das proteções (`src/regras/bancoQuestoes.test.ts`):

```ts
import { describe, expect, it } from 'vitest';
import { PERGUNTAS_DIAGNOSTICAS } from '@/dados/demo/perguntasDiagnosticas';
import { QUESTOES } from '@/dados/demo/questoes';
import type { QuestaoEditavel } from '@/dados/tipos';
import { validarQuestao } from './bancoQuestoes';

const editavel = (id: string): QuestaoEditavel => {
  const q = QUESTOES.find((x) => x.id === id)!;
  return { id: q.id, quizId: q.quizId, enunciado: q.enunciado, alternativas: q.alternativas, respostaCorreta: q.respostaCorreta, nivelDificuldade: q.nivelDificuldade, explicacao: q.explicacao, ativa: q.ativa };
};

describe('banco de questões (RF10)', () => {
  it('RF10: aceita uma edição comum', () => {
    expect(validarQuestao(editavel('juros-compostos-2-m1'), QUESTOES, PERGUNTAS_DIAGNOSTICAS)).toBeNull();
  });
  it('RF10: a lição 1 de cada trilha mantém pelo menos 3 questões ativas', () => {
    const semUma = QUESTOES.map((q) => (q.id === 'juros-compostos-1-f1' ? { ...q, ativa: false } : q));
    expect(validarQuestao({ ...editavel('juros-compostos-1-m1'), ativa: false }, semUma, PERGUNTAS_DIAGNOSTICAS))
      .toBe('A lição 1 de cada trilha precisa de pelo menos 3 questões ativas');
    expect(validarQuestao({ ...editavel('juros-compostos-1-m1'), quizId: 'juros-compostos-2-quiz' }, semUma, PERGUNTAS_DIAGNOSTICAS))
      .toBe('A lição 1 de cada trilha precisa de pelo menos 3 questões ativas');
  });
  it('RF05: enunciado igual a uma pergunta do teste diagnóstico é bloqueado', () => {
    const copia = { ...editavel('juros-compostos-2-m1'), enunciado: PERGUNTAS_DIAGNOSTICAS[0].enunciado.toUpperCase() };
    expect(validarQuestao(copia, QUESTOES, PERGUNTAS_DIAGNOSTICAS)).toBe('Este enunciado é igual a uma pergunta do teste diagnóstico');
  });
  it('RF10: as 4 alternativas precisam ser diferentes', () => {
    const repetida = { ...editavel('juros-compostos-2-m1'), alternativas: ['A', 'a', 'B', 'C'] as [string, string, string, string] };
    expect(validarQuestao(repetida, QUESTOES, PERGUNTAS_DIAGNOSTICAS)).toBe('As 4 alternativas precisam ser diferentes');
  });
});
```

- [ ] 18.2 Implementar `src/regras/bancoQuestoes.ts`:

```ts
import type { PerguntaDiagnostica, Questao, QuestaoEditavel } from '@/dados/tipos';
import { normalizarTexto } from '@/lib/texto';

/** RF10: devolve a mensagem do primeiro problema, ou null. `todas` é o banco antes da mudança. */
export function validarQuestao(q: QuestaoEditavel, todas: Questao[], diagnosticas: PerguntaDiagnostica[]): string | null {
  if (new Set(q.alternativas.map(normalizarTexto)).size < 4) return 'As 4 alternativas precisam ser diferentes';
  if (diagnosticas.some((d) => normalizarTexto(d.enunciado) === normalizarTexto(q.enunciado))) {
    return 'Este enunciado é igual a uma pergunta do teste diagnóstico';
  }
  const depois = [...todas.filter((x) => x.id !== q.id), { ...q, id: q.id ?? 'nova' }];
  const quizzesDaLicao1 = new Set(todas.map((x) => x.quizId).filter((id) => id.endsWith('-1-quiz')));
  for (const quizId of quizzesDaLicao1) {
    if (depois.filter((x) => x.quizId === quizId && x.ativa).length < 3) return 'A lição 1 de cada trilha precisa de pelo menos 3 questões ativas';
  }
  return null;
}
```

- [ ] 18.3 `local/admin.ts`: `listarQuestoes()` (todas, como `QuestaoAdmin`, com `trilhaId`, `licaoId` e `licaoOrdem` vindos do quiz; ordenadas por trilha, lição e nível) e `salvarQuestao(q)` (`exigirAdmin()`; `validarQuestao`; nova recebe `id = 'q-' + crypto.randomUUID()` e `criadoEm`; edição atualiza os campos e `atualizadoEm`; devolve o id).
- [ ] 18.4 `src/pages/admin/esquemaQuestao.ts` (Zod): trilha, lição e nível obrigatórios; enunciado de 10 a 300; cada alternativa de 1 a 150; resposta correta de 0 a 3; explicação de 10 a 400; `ativa` booleano; e, no `superRefine`, "As 4 alternativas precisam ser diferentes". O `quizId` sai da lição escolhida (`<lição>-quiz`).
- [ ] 18.5 T21 (`/admin/questoes`, com `lazy`): contagem "N questões · M ativas"; `Input` de busca ("Buscar no enunciado"), filtrando por `normalizarTexto` enquanto se digita; `Table` com Enunciado (2 linhas, `line-clamp-2`), Trilha, Lição, Nível (`EtiquetaNivel`), Status (ícone e texto) e Editar; botão Nova questão; painel lateral (`Sheet`) com o formulário do PRD (o `Select` de Lição só mostra as da trilha escolhida); erro de `salvarQuestao` aparece no topo do painel; toasts "Questão salva", "Questão inativada", "Questão reativada"; busca vazia: "Nenhuma questão encontrada para {termo}". Não existe botão nem ação de excluir.

Parte Supabase:

- [ ] 18.6 `supabase/migrations/20261101120700_admin_questoes.sql`:

```sql
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
```

O `raise exception` desfaz a gravação inteira, então a proteção vale também para edições que já tinham sido gravadas na mesma chamada.

- [ ] 18.7 `supabase/admin.ts`: `listarQuestoes()` = `rpc('admin_listar_questoes')` convertido para `QuestaoAdmin`; `salvarQuestao(q)` = `rpc('admin_salvar_questao', { p_id: q.id, p_quiz_id: q.quizId, p_enunciado: q.enunciado, p_alternativas: q.alternativas, p_resposta_correta: q.respostaCorreta, p_nivel: q.nivelDificuldade, p_explicacao: q.explicacao, p_ativa: q.ativa })`.

Conferir: `npm run test`, `npm run lint`, `npm run build`; critérios de T21.

O que o usuário testa:
1. A tabela lista 48 questões com trilha, lição, nível e status; a busca filtra enquanto digita.
2. Criar uma questão nova na lição 2 de Cartão de Crédito e editá-la; não há excluir.
3. Inativar uma questão da lição 2 de Juros Compostos: ela não aparece mais no quiz.
4. Na lição 1 de uma trilha, inativar até sobrarem 3: a próxima inativação é bloqueada com a mensagem.
5. Modo Supabase: rodar o SQL e repetir 2 e 4 com a conta de administrador.

Commit sugerido: `feat: banco de questões com inativação e proteções (RF10)`.

---

## Passo 19 — T23 Exportar dados (Importante)

Ler antes: PRD 2.12 (T23); instruções do projeto (CSV da pesquisa).

Arquivos:
- Criar: `src/lib/csv.ts`, `src/lib/csv.test.ts`, `src/pages/admin/ExportarDados.tsx`.
- Modificar: `src/regras/pesquisa.ts`, `src/regras/pesquisa.test.ts`, `local/admin.ts`, `supabase/admin.ts`, `src/app/rotas.tsx`.

Parte local:

- [ ] 19.1 Teste do CSV (`src/lib/csv.test.ts`):

```ts
import { expect, it } from 'vitest';
import { gerarCsv } from './csv';

it('RF12: UTF-8 com BOM, ponto e vírgula, CRLF e aspas quando precisa', () => {
  const csv = gerarCsv(['a', 'b'], [['x;y', 'diz "oi"'], [1, 'Não sei']]);
  expect(csv.startsWith('﻿')).toBe(true);
  expect(csv).toBe('﻿a;b\r\n"x;y";"diz ""oi"""\r\n1;Não sei\r\n');
});
```

Implementação (`src/lib/csv.ts`):

```ts
const campo = (valor: string | number) => {
  const texto = String(valor);
  return /[;"\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
};

/** CSV para o Excel em português: separador ";", UTF-8 com BOM e quebra de linha CRLF (RF12). */
export function gerarCsv(cabecalho: string[], linhas: (string | number)[][]): string {
  return `﻿${[cabecalho, ...linhas].map((l) => l.map(campo).join(';')).join('\r\n')}\r\n`;
}

export function baixarArquivo(nome: string, conteudo: string): void {
  const url = URL.createObjectURL(new Blob([conteudo], { type: 'text/csv;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: nome });
  link.click();
  URL.revokeObjectURL(url);
}
```

- [ ] 19.2 Linhas da exportação (acrescentar em `pesquisa.test.ts` e em `pesquisa.ts`):

```ts
// teste
import { linhasDeExportacao } from './pesquisa';

it('RF12: uma linha por pergunta respondida, ordenada e sem nome nem e-mail', () => {
  const banco = criarDadosDemo(new Date('2026-11-04T15:00:00Z'));
  const linhas = linhasDeExportacao(banco.testes, banco.respostasTeste, PERGUNTAS_DIAGNOSTICAS);
  expect(linhas).toHaveLength(51);
  expect(Object.keys(linhas[0])).toEqual(['idPseudonimizado', 'tipoTeste', 'forma', 'versao', 'data', 'pergunta', 'respostaMarcada', 'acerto', 'notaTotal']);
  const alex = linhas.filter((l) => l.idPseudonimizado === 'P-3C9E');
  expect(alex.map((l) => [l.pergunta, l.respostaMarcada, l.acerto])).toEqual([[1, 'Mais de R$ 102', 1], [2, 'Exatamente o mesmo', 0], [3, 'Não sei', 0]]);
});
```

```ts
// pesquisa.ts
import { formatarData } from '@/lib/formatacao';
import type { LinhaExportacao } from '@/dados/tipos';

export function linhasDeExportacao(testes: TesteDiagnostico[], respostas: RespostaTeste[], perguntas: PerguntaDiagnostica[]): LinhaExportacao[] {
  const pergunta = new Map(perguntas.map((p) => [p.id, p]));
  const linhas = testes.filter((t) => t.concluidoEm).flatMap((t) =>
    respostas.filter((r) => r.testeId === t.id).map((r): LinhaExportacao => {
      const p = pergunta.get(r.perguntaId)!;
      return {
        idPseudonimizado: t.pseudonimo, tipoTeste: t.tipoTeste, forma: t.forma, versao: t.versao, data: formatarData(r.respondidaEm),
        pergunta: p.numero, respostaMarcada: p.alternativas[r.alternativaMarcada], acerto: r.acertou ? 1 : 0, notaTotal: t.pontuacaoTotal ?? 0,
      };
    }),
  );
  const ordemTipo = { pre: 0, pos: 1 };
  return linhas.sort((a, b) => a.idPseudonimizado.localeCompare(b.idPseudonimizado) || ordemTipo[a.tipoTeste] - ordemTipo[b.tipoTeste] || a.pergunta - b.pergunta);
}
```

- [ ] 19.3 `local/admin.ts`: `exportarRespostas()` (`exigirAdmin()` e `linhasDeExportacao`).
- [ ] 19.4 T23 (`/admin/exportar`, com `lazy`): prévia com as 20 primeiras linhas numa `Table` com as colunas do arquivo e "N linhas"; botão Baixar CSV com `gerarCsv(['id_pseudonimizado', 'tipo_teste', 'forma', 'versao', 'data', 'pergunta', 'resposta_marcada', 'acerto', 'nota_total'], linhas)`; nome do arquivo `respostas-testes-<sufixo>-<AAAA-MM-DD>.csv`, com o sufixo `demonstracao` no modo local e `contas-de-teste` no modo Supabase (o sufixo sai no projeto de produção, PRD 8.8) e a data de `diaNoFuso(agora())`; sem dados: "Ainda não há respostas para exportar."

Parte Supabase:

- [ ] 19.5 `supabase/admin.ts`: `exportarRespostas()` = `rpc('exportar_respostas_testes')` (criada no passo 17), convertendo `data` de `AAAA-MM-DD` para `dd/mm/aaaa` e `acerto` para `0 | 1`.

Conferir: `npm run test`, `npm run lint`, `npm run build`; critérios de T23.

O que o usuário testa:
1. Modo local, como administrador: prévia com as colunas do arquivo e "51 linhas"; baixar e abrir no Excel: acentos corretos, uma coluna por campo, "Não sei" com acerto 0, nenhum nome ou e-mail.
2. Modo Supabase: o arquivo sai com as contas de teste e o sufixo `contas-de-teste`.

Commit sugerido: `feat: exportação pseudonimizada das respostas dos testes em CSV (RF12)`.

---

## Passo 20 — Lembretes e T18 Notificações (Desejável)

Ler antes: PRD 2.10 (Lembretes e T18).

Arquivos:
- Criar: `src/hooks/useVerificadorDeLembretes.ts`, `src/pages/jovem/Notificacoes.tsx`, `supabase/migrations/20261101120800_lembretes.sql`.
- Modificar: `local/notificacoes.ts`, `supabase/notificacoes.ts`, `src/hooks/dados/useNotificacoes.ts`, `src/layouts/LayoutJovem.tsx`, `src/app/rotas.tsx`.

Parte local:

- [ ] 20.1 `local/notificacoes.ts`, o resto do contrato:

```ts
async marcarComoLida(id) {
  alterarBanco((banco) => { const n = banco.notificacoes.find((x) => x.id === id && x.usuarioId === usuarioDaSessao()); if (n) n.lida = true; });
  await responder(null);
},
async marcarTodasComoLidas() {
  const usuarioId = usuarioDaSessao();
  alterarBanco((banco) => banco.notificacoes.filter((n) => n.usuarioId === usuarioId).forEach((n) => { n.lida = true; }));
  await responder(null);
},
async verificarLembrete() {
  const usuarioId = usuarioDaSessao();
  const nova = alterarBanco((banco) => {
    const usuario = banco.usuarios.find((u) => u.id === usuarioId)!;
    const instante = agora();
    const progressos = banco.progressos.filter((p) => p.usuarioId === usuarioId);
    const respostas = banco.respostasQuiz.filter((r) => r.usuarioId === usuarioId);
    const emAndamento = TRILHAS
      .map((trilha) => ({ trilha, p: calcularProgressoTrilha(trilha.id, progressos, respostas, 5) }))
      .filter((x) => x.p.status === 'em_andamento')
      .sort((a, b) => (b.p.dataUltimoAcesso ?? '').localeCompare(a.p.dataUltimoAcesso ?? ''));
    const ultimoLembreteEm = banco.notificacoes.filter((n) => n.usuarioId === usuarioId && n.tipo === 'lembrete').map((n) => n.dataEnvio).sort().at(-1) ?? null;
    const gerar = deveGerarLembrete({
      receberLembretes: usuario.receberLembretes, temTrilhaEmAndamento: emAndamento.length > 0, ultimaAtividadeEm: usuario.ultimaAtividadeEm,
      ultimoLembreteEm, limiteHoras: parametrosAtuaisLocal(banco).limite_inatividade_horas, agora: instante,
    });
    if (!gerar) return null;
    const { trilha, p } = emAndamento[0];
    const notificacao: Notificacao = {
      id: crypto.randomUUID(), usuarioId, tipo: 'lembrete', link: `/trilhas/${trilha.slug}`, dataEnvio: instante.toISOString(), lida: false,
      mensagem: `Sua trilha ${trilha.titulo} está esperando por você. Que tal continuar a Lição ${p.licoesConcluidas + 1}?`,
    };
    banco.notificacoes.push(notificacao);
    return notificacao;
  });
  return responder(nova);
},
```

- [ ] 20.2 `useVerificadorDeLembretes()` (no `LayoutJovem`): chama `repositorios.notificacoes.verificarLembrete()` ao montar, quando a aba volta a ficar visível (`visibilitychange`), a cada minuto e quando o relógio simulado muda (`assinarAparelho`). Se vier uma notificação: `toast(mensagem, { action: { label: 'Continuar', onClick: () => navigate(link) } })` e invalidar `notificacoes`.
- [ ] 20.3 T18 (`/notificacoes`): lista com ícone do tipo (`Bell` para lembrete, `Award` para conquista, `Info` para sistema), mensagem e `formatarDataHora`; não lidas com um ponto e o texto "Nova" só para leitor de tela (`sr-only`); tocar marca como lida e abre o `link`; botão "Marcar todas como lidas"; vazio: "Nenhuma notificação por aqui." O sino do topo (passo 10) atualiza junto.

Parte Supabase:

- [ ] 20.4 `supabase/migrations/20261101120800_lembretes.sql`:

```sql
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
```

- [ ] 20.5 `supabase/notificacoes.ts`: `marcarComoLida(id)` = `update({ lida: true }).eq('id', Number(id))`; `marcarTodasComoLidas()` = `update({ lida: true }).eq('usuario_id', id).eq('lida', false)`; `verificarLembrete()` = `rpc('gerar_lembrete')`, com `dataEnvio` passando por `iso`.

Conferir: `npm run test`, `npm run lint`, `npm run build`; critérios de T18 e dos lembretes, e o critério 5 de T19.

O que o usuário testa (modo local):
1. O sino mostra 1; a lista tem 3 notificações, 1 nova; tocar marca como lida.
2. Perfil → "Simular 48 h sem acesso": chega o toast do lembrete, o sino aumenta e a sequência vai a 0.
3. Com "Receber lembretes" desligado, simular de novo (depois de "Reiniciar dados") não gera lembrete.
4. Recarregar a página não repete o lembrete.

Commit sugerido: `feat: lembretes de inatividade e central de notificações (RF09, RN04)`.

---

## Passo 21 — T22 Parâmetros, com histórico (Desejável)

Ler antes: PRD 2.12 (T22); instruções do projeto (parâmetros com autor e data).

Arquivos:
- Criar: `src/regras/parametros.ts`, `src/regras/parametros.test.ts`, `src/pages/admin/Parametros.tsx`, `supabase/migrations/20261101120900_parametros.sql`.
- Modificar: `local/admin.ts`, `supabase/admin.ts`, `src/app/rotas.tsx`.

Parte local:

- [ ] 21.1 Validação, com teste (`src/regras/parametros.test.ts`):

```ts
import { describe, expect, it } from 'vitest';
import { validarParametros } from './parametros';

const padrao = { limite_inatividade_horas: 48, janela_motor: 5, limiar_subida: 80, limiar_descida: 40 };

describe('parâmetros (RF11)', () => {
  it('RF11: aceita os valores padrão', () => {
    expect(validarParametros(padrao)).toEqual({});
  });
  it('RF11: descida precisa ser menor que subida; faixas e inteiros', () => {
    expect(validarParametros({ ...padrao, limiar_descida: 80 })).toEqual({ limiar_descida: 'O limiar de descida precisa ser menor que o de subida' });
    expect(validarParametros({ ...padrao, janela_motor: 2 })).toEqual({ janela_motor: 'Use um número inteiro de 3 a 20' });
    expect(validarParametros({ ...padrao, limite_inatividade_horas: 1.5 })).toEqual({ limite_inatividade_horas: 'Use um número inteiro de 1 a 720' });
  });
});
```

```ts
// src/regras/parametros.ts
import type { ChaveParametro } from '@/dados/tipos';

/** RF11: mensagens por campo; objeto vazio quando está tudo certo. */
export function validarParametros(v: Record<ChaveParametro, number>): Partial<Record<ChaveParametro, string>> {
  const erros: Partial<Record<ChaveParametro, string>> = {};
  const inteiroEntre = (n: number, min: number, max: number) => Number.isInteger(n) && n >= min && n <= max;
  if (!inteiroEntre(v.limite_inatividade_horas, 1, 720)) erros.limite_inatividade_horas = 'Use um número inteiro de 1 a 720';
  if (!inteiroEntre(v.janela_motor, 3, 20)) erros.janela_motor = 'Use um número inteiro de 3 a 20';
  if (!(v.limiar_subida >= 1 && v.limiar_subida <= 100)) erros.limiar_subida = 'Use um valor de 1 a 100';
  if (!(v.limiar_descida >= 0 && v.limiar_descida <= 99)) erros.limiar_descida = 'Use um valor de 0 a 99';
  else if (v.limiar_descida >= v.limiar_subida) erros.limiar_descida = 'O limiar de descida precisa ser menor que o de subida';
  return erros;
}
```

- [ ] 21.2 `local/admin.ts`: `parametrosAtuais()` (`parametrosAtuaisLocal`); `historicoParametros()` (do mais recente para o mais antigo, com `valorAnterior` = o valor anterior da mesma chave e `autor` = nome do administrador ou "Sistema (valor padrão)"); `salvarParametros(v)` (`exigirAdmin()`, `validarParametros` e, para cada valor diferente do atual, uma linha nova com `alteradoPor` e `alteradoEm = agora()`).
- [ ] 21.3 T22 (`/admin/parametros`, com `lazy`): formulário com os 4 campos (rótulos e unidades do PRD), erros por campo de `validarParametros`, Salvar com o toast "Parâmetros salvos. O quiz já usa os novos valores." e a tabela do histórico (Data e hora, Autor, Parâmetro, Valor anterior, Novo valor).

Parte Supabase:

- [ ] 21.4 `supabase/migrations/20261101120900_parametros.sql`:

```sql
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
```

- [ ] 21.5 `supabase/admin.ts`: `parametrosAtuais()` = `from('parametros_sistema').select('chave, valor, alterado_em').order('alterado_em')`, guardando o último valor de cada chave; `historicoParametros()` = `rpc('admin_historico_parametros')`; `salvarParametros(v)` = `rpc('admin_salvar_parametros', { p_inatividade: v.limite_inatividade_horas, p_janela: v.janela_motor, p_subida: v.limiar_subida, p_descida: v.limiar_descida })`. O quiz no servidor já lê os parâmetros a cada resposta (`privado.parametro`).

Conferir: `npm run test`, `npm run lint`, `npm run build`; critérios de T22.

O que o usuário testa:
1. O formulário abre com 48, 5, 80 e 40; descida 80 com subida 80 mostra o erro e não salva.
2. Mudar a janela para 3 e salvar: o histórico ganha uma linha com o autor e a data; num quiz novo, o nível muda depois de 3 respostas.
3. Voltar a janela para 5 (nova linha no histórico).
4. Modo Supabase: rodar o SQL e repetir 1 e 2.

Commit sugerido: `feat: parâmetros do motor e da inatividade com histórico (RF11)`.

---

## Passo 22 — Revisão final e publicação (todas as prioridades)

Ler antes: PRD 5.6, 6.9, 7.4 e 8.8; instruções do projeto (Documentação do TCC).

Tarefas:

- [ ] 22.1 Erro inesperado (T24): `errorElement` nas rotas de nível mais alto com a tela "Algo deu errado" e o botão Recarregar (`window.location.reload()`).
- [ ] 22.2 Acessibilidade (PRD 5.6), tela por tela: um `h1` por tela; ao trocar de tela, o foco vai para o `h1` (um efeito nos layouts com `useLocation()` que chama `focus()` no `h1` com `tabIndex={-1}`); foco visível; ordem de foco; rótulos em todos os campos e botões só com ícone; toques de pelo menos 44 px; nada só por cor; `aria-live` no feedback do quiz, no banner e nos toasts; teclas 1 a 4, Enter e Esc; contraste conferido no DevTools (Lighthouse → Accessibility) nos dois temas.
- [ ] 22.3 Estados: skeleton em todas as listas e cards; estados vazios do PRD 7.4; mensagens de erro em português nos dois modos.
- [ ] 22.4 Textos: conferir com o PRD os textos de botões, avisos e mensagens; termos financeiros explicados; nenhum gênero marcado sem necessidade.
- [ ] 22.5 Desempenho (RNF03): `npm run build` e `npm run preview`; no DevTools com o perfil "Fast 4G", abrir uma lição a partir da trilha em até 2 s.
- [ ] 22.6 Roteiro de demonstração (PRD 6.9) do começo ao fim no modo local, depois de "Reiniciar dados de demonstração".
- [ ] 22.7 Modo Supabase: repetir a conferência do E2.7 e passar pelas telas dos passos 13 a 21 com uma conta de jovem e uma de administrador.
- [ ] 22.8 Publicação: `npm run deploy` (no modo escolhido pelo grupo para a entrega; o `VITE_FONTE_DADOS` vai no build) e conferir a URL do Worker; se o modo for Supabase, a URL precisa estar nas Redirect URLs (E2.1.1).
- [ ] 22.9 Para a documentação (as instruções do projeto pedem o texto pronto para colar no docx): preparar para o usuário o texto das divergências que o código confirmou (stack real, RF06 a RF08 e prioridades, seleção por lição e banco 3/6/3, simulador de cartão com parcelamento, quarta trilha, offline e push simulados, classes novas do modelo de dados) e, para o artigo, só os números medidos agora: quantidade de casos de teste dos simuladores e do motor (`npm run test`), quantidade de questões por nível (12 por trilha: 3, 6 e 3). Nenhum número dos dados fictícios entra.

Conferir: `npm run test`, `npm run lint` e `npm run build` sem erro; critérios de aceite de todas as telas (T01 a T24).

O que o usuário testa: o roteiro do 22.6 na URL publicada.

Commit sugerido: `chore: revisão final de acessibilidade, estados e textos`.

---

## Apêndice — Cobertura do PRD

| PRD | Onde no plano |
|---|---|
| 2.1 (T01 a T04), RF01, RNF06 | Passo 6; E2.3 (trigger dos aceites); E2.6 (Auth real e redefinição de senha) |
| 2.2 (T05, T06), RF05 | Passos 12 e 13; E2.3 (pseudônimo); E2.5 (funções dos testes) |
| 2.3 (T07) | Passo 10; cards nos passos 13, 14 e 15 |
| 2.4 (T08 a T10, offline), RNF02, RNF03, RNF08 | Passos 7 e 11; 22.5 |
| 2.5 (motor, XP, T11, T12), RN02, RN03, RF06 | Passos 8 e 9; E2.5 (`proxima_questao`, `responder_questao`) |
| 2.6 e 2.7 (T13, T14), RF03, RN01, RN06, RNF01, RNF05 | Passos 3 e 4 |
| 2.8 (T15), RF04, RN05 | Passos 3 e 5 |
| 2.9 (T16), RF07, RNF04 | Passo 15 |
| 2.10 (conquistas, sequência, lembretes, T17, T18), RF08, RF09, RN04 | Passos 8, 14 e 20; E2.5 (`conceder_conquistas`) |
| 2.11 (T19 e ferramentas) | Passos 6, 13 e 16 |
| 2.12 (T20 a T23), RF10, RF11, RF12 | Passos 17, 18, 19 e 21 |
| 4.3 e 4.4 (rotas e regras de acesso), T24 | Passos 1, 6 e 22 |
| 5 (estilo, acessibilidade), RNF07 | Passos 1 e 22 |
| 6 (dados, demonstração) | Passos 2, 7, 9 e 11 |
| 7.3 (testes) | Passos 2, 3, 4, 6, 7, 8, 9, 12, 14, 15, 17, 18, 19 e 21 |
| 7.6 (ordem de construção) | Seção 1 (com a etapa 2 entre os passos 12 e 13) |
| 8 (modelo de dados, RLS, pseudônimo) | E2.1 a E2.7; SQL dos passos 15, 17, 18, 20 e 21 |
