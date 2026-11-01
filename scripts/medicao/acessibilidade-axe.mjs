// Medição (RNF03 e RNF07). Fora do package.json de propósito: precisa de `npm i puppeteer-core axe-core` numa pasta à parte, do Chrome instalado
// (caminho em executablePath) e do build servido em http://localhost:4180 (`npm run build` e `npx vite preview --port 4180`, com VITE_FONTE_DADOS=local).
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = 'http://localhost:4180';

const navegador = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--force-prefers-reduced-motion=0'],
});

async function nova(tema = 'claro', sessao = 'demo-alex', rede = true) {
  const pagina = await navegador.newPage();
  await pagina.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await pagina.evaluateOnNewDocument((t, s) => {
    localStorage.setItem('efg:tema', t);
    if (!s) localStorage.removeItem('efg:aparelho');
    if (s) localStorage.setItem('efg:aparelho', JSON.stringify({ sessaoUsuarioId: s, trilhasBaixadas: ['juros-compostos'], deslocamentoRelogioMs: 0, posTesteLiberadoDemo: false }));
  }, tema, sessao);
  const cdp = await pagina.createCDPSession();
  if (rede) {
    // Fast 4G do DevTools: 9 Mbps de descida, 1,5 Mbps de subida, 60 ms de latência; CPU 4x mais lenta.
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8, latency: 60 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  }
  return { pagina, cdp };
}

const resultado = { carga: [], abrirLicao: [], contraste: [] };

// 1. Carga fria do Início e abertura de uma lição a partir da trilha (5 repetições, sem cache do navegador).
for (let i = 0; i < (process.env.SO_CONTRASTE ? 0 : 5); i++) {
  const { pagina, cdp } = await nova('claro', 'demo-alex', true);
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const t0 = Date.now();
  await pagina.goto(`${BASE}/inicio`, { waitUntil: 'domcontentloaded' });
  await pagina.waitForSelector('main h1', { timeout: 30000 });
  await pagina.waitForFunction(() => !document.querySelector('[aria-label^="Carregando"]') && document.querySelectorAll('a[href^="/trilhas/"]').length > 0, { timeout: 30000 });
  resultado.carga.push(Date.now() - t0);

  await pagina.evaluate(() => [...document.querySelectorAll('a')].find((a) => a.getAttribute('href') === '/trilhas')?.click());
  await pagina.waitForFunction(() => location.pathname === '/trilhas');
  await pagina.waitForSelector('a[href="/trilhas/orcamento-pessoal"]');
  await pagina.evaluate(() => document.querySelector('a[href="/trilhas/orcamento-pessoal"]').click());
  await pagina.waitForSelector('a[href="/trilhas/orcamento-pessoal/licoes/1"]');
  await new Promise((r) => setTimeout(r, 800));
  const t1 = Date.now();
  await pagina.evaluate(() => document.querySelector('a[href="/trilhas/orcamento-pessoal/licoes/1"]').click());
  await pagina.waitForFunction(() => location.pathname.endsWith('/licoes/1') && document.querySelector('article h1'), { timeout: 30000 });
  resultado.abrirLicao.push(Date.now() - t1);
  await pagina.close();
}

// 2. Contraste (axe-core) em telas principais, nos dois temas.
const telas = [
  ['/', null, 'boas-vindas'], ['/entrar', null, 'entrar'], ['/cadastro', null, 'cadastro'],
  ['/inicio', 'demo-alex', 'início'], ['/trilhas', 'demo-alex', 'trilhas'], ['/trilhas/juros-compostos', 'demo-alex', 'trilha'],
  ['/trilhas/orcamento-pessoal/licoes/1', 'demo-alex', 'lição'], ['/simuladores/juros-compostos', 'demo-alex', 'simulador de juros'],
  ['/simuladores/cartao-de-credito', 'demo-alex', 'simulador de cartão'], ['/ranking', 'demo-alex', 'ranking'],
  ['/conquistas', 'demo-alex', 'conquistas'], ['/notificacoes', 'demo-alex', 'notificações'], ['/perfil', 'demo-alex', 'perfil'],
  ['/admin', 'demo-admin', 'admin: visão geral'], ['/admin/questoes', 'demo-admin', 'admin: questões'],
  ['/admin/parametros', 'demo-admin', 'admin: parâmetros'], ['/admin/exportar', 'demo-admin', 'admin: exportar'],
];
for (const tema of ['claro', 'escuro']) {
  for (const [rota, sessao, nome] of telas) {
    const { pagina } = await nova(tema === 'claro' ? 'claro' : 'escuro', sessao, false);
    await pagina.goto(`${BASE}${rota}`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1200));
    await pagina.evaluate((src) => { const s = document.createElement('script'); s.textContent = src; document.head.appendChild(s); }, axeSource);
    const r = await pagina.evaluate(async () => {
      const res = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } });
      return {
        falhas: res.violations.flatMap((v) => v.nodes.map((n) => ({ regra: v.id, alvo: n.target.join(' '), msg: (n.any[0]?.message || n.all[0]?.message || '').slice(0, 120) }))),
        incompletos: res.incomplete.flatMap((v) => v.nodes).length,
        aprovados: res.passes.flatMap((v) => v.nodes).length,
      };
    });
    resultado.contraste.push({ tema, nome, caminho: pagina.url().replace(BASE, ''), ...r });
    await pagina.close();
  }
}

await navegador.close();
console.log(JSON.stringify(resultado, null, 1));
