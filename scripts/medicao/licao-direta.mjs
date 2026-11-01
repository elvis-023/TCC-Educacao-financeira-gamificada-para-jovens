// Medição (RNF03 e RNF07). Fora do package.json de propósito: precisa de `npm i puppeteer-core axe-core` numa pasta à parte, do Chrome instalado
// (caminho em executablePath) e do build servido em http://localhost:4180 (`npm run build` e `npx vite preview --port 4180`, com VITE_FONTE_DADOS=local).
import puppeteer from 'puppeteer-core';
const BASE = 'http://localhost:4180';
const navegador = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const rodar = async (cpu, rotulo) => {
  const tempos = [];
  for (let i = 0; i < 7; i++) {
    const pagina = await navegador.newPage();
    await pagina.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await pagina.evaluateOnNewDocument(() => {
      localStorage.setItem('efg:aparelho', JSON.stringify({ sessaoUsuarioId: 'demo-alex', trilhasBaixadas: [], deslocamentoRelogioMs: 0, posTesteLiberadoDemo: false }));
    });
    const cdp = await pagina.createCDPSession();
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8, latency: 60 });
    if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
    const t0 = Date.now();
    await pagina.goto(`${BASE}/trilhas/orcamento-pessoal/licoes/1`, { waitUntil: 'domcontentloaded' });
    await pagina.waitForSelector('article h1', { timeout: 30000 });
    tempos.push(Date.now() - t0);
    await pagina.close();
  }
  tempos.sort((a, b) => a - b);
  console.log(rotulo, JSON.stringify(tempos), 'mediana', tempos[3], 'máx', tempos[tempos.length - 1]);
};
await rodar(1, 'rede 9 Mbps/60 ms, CPU normal   :');
await rodar(4, 'rede 9 Mbps/60 ms, CPU 4x mais lenta:');
await navegador.close();
