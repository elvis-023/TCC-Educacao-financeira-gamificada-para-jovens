# Publicação na Cloudflare

O app é um site estático (a pasta `dist/` gerada pelo build) servido por um Worker da Cloudflare. Há duas versões, cada uma com a sua URL:

| Versão | Comando | Worker | Dados |
|---|---|---|---|
| **Principal** | `npm run deploy` | `educacao-financeira-gamificada` | Supabase (projeto de desenvolvimento) |
| **Demonstração** | `npm run deploy:demo` | `educacao-financeira-gamificada-demo` | Fictícios, no navegador de cada pessoa |

## O que cada comando faz

- `npm run deploy` = `npm run build` e depois `wrangler deploy`.
  - `npm run build` = `tsc -b` (confere os tipos) e `vite build` (gera `dist/` com o `VITE_FONTE_DADOS` e as chaves públicas do Supabase que estão no `.env` naquele momento).
  - `wrangler deploy` envia `dist/` para a Cloudflare, conforme `wrangler.jsonc`.
- `npm run deploy:demo` = `npm run build:demo` (`vite build --mode demo`, que lê o `.env.demo` com `VITE_FONTE_DADOS=local`, e grava em `dist-demo/`) e depois `wrangler deploy --config wrangler.demo.jsonc`.

## Passo a passo

1. Crie uma conta gratuita em https://dash.cloudflare.com/sign-up e confirme o e-mail.
2. No terminal, dentro da pasta do projeto: `npx wrangler login`. O navegador abre; clique em Allow.
3. Confira o `.env`: `VITE_FONTE_DADOS=supabase`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` preenchidos.
4. Rode `npm run deploy`. No fim, o terminal mostra a URL: `https://educacao-financeira-gamificada.<seu-subdominio>.workers.dev`.
5. No painel do Supabase (Authentication, URL Configuration):
   - Site URL: a URL do Worker.
   - Redirect URLs: a URL do Worker e `http://localhost:5173`.
   - Authentication, Providers, Email: desligue "Confirm email".
6. Abra a URL, crie uma conta com e-mail real e faça o fluxo completo. Entre também com a conta de administrador.
7. Para a versão de demonstração: `npm run deploy:demo`. A URL termina em `-demo.<seu-subdominio>.workers.dev`. Ela não usa o Supabase, então não precisa de nenhum ajuste no painel.

## Depois de mudar o código

Rode o mesmo comando de novo (`npm run deploy` e, se quiser, `npm run deploy:demo`). A URL não muda.

## Domínio próprio (opcional)

No painel da Cloudflare, Workers & Pages, abra o Worker, Settings, Domains & Routes, Add, Custom domain. Exige um domínio gerenciado na Cloudflare.
