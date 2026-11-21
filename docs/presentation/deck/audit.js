// Captures crisp phone-sized screenshots of the running Expo web app with headless Edge (CDP).
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const URL = 'http://localhost:8081';
const OUT = path.join(__dirname, '..', 'shots');
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const profile = path.join(require('os').tmpdir(), 'gf-capture-profile');
  fs.rmSync(profile, { recursive: true, force: true });
  const edge = spawn(EDGE, [
    '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--disable-gpu',
    '--window-size=390,844', '--hide-scrollbars', 'about:blank',
  ], { stdio: 'ignore' });

  let targets;
  for (let i = 0; i < 40; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.length) break; } catch {}
    await sleep(250);
  }
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: false });

  const shot = async (name) => {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT, '..', 'audit', name + '.png'), Buffer.from(r.result.data, 'base64'));
    console.log('shot', name);
  };
  const waitFor = async (text, ms = 30000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (await evaluate(`document.body && document.body.innerText.includes(${JSON.stringify(text)})`)) return true;
      await sleep(300);
    }
    throw new Error('timeout waiting for ' + text);
  };
  // Click the visible element whose own text matches (exact first, then prefix), via real mouse events.
  const click = async (text, { exact = true, last = false } = {}) => {
    const pos = await evaluate(`(() => {
      const want = ${JSON.stringify(text)};
      const els = [...document.querySelectorAll('div,span,a,button')].filter(e => {
        const t = (e.innerText || '').trim();
        if (!t) return false;
        const ok = ${exact} ? t === want : t.startsWith(want);
        if (!ok) return false;
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      if (!els.length) return null;
      els.sort((a, b) => a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height);
      const e = ${last} ? els[els.length - 1] : els[0];
      let r = e.getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight - 90) { e.scrollIntoView({ block: "center" }); r = e.getBoundingClientRect(); }
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`);
    if (!pos) throw new Error('not found: ' + text);
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', { type, x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
    }
  };
  const scrollTo = (text) =>
    evaluate(`(() => { const e = [...document.querySelectorAll('div')].find(d => d.innerText && d.innerText.trim() === ${JSON.stringify(text)}); if (e) e.scrollIntoView({ block: 'start' }); return !!e; })()`);

  const waitImages = async (ms = 25000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const ok = await evaluate(`[...document.images].every(i => i.complete && i.naturalWidth > 0)`);
      if (ok) break;
      await sleep(500);
    }
    await sleep(800);
  };
  const step = async (name, fn) => {
    try { await fn(); } catch (e) {
      console.log('FAILED', name, e.message);
      console.log('  screen:', String(await evaluate('document.body.innerText')).slice(-700).replace(/\n+/g, ' | '));
      console.log('  buttons:', await evaluate(`[...document.querySelectorAll('[role=button],[role=tab],[tabindex]')].map(e => (e.innerText||'').trim()).filter(Boolean).slice(-15).join(' / ')`));
    }
  };
  const home = async () => { await send('Page.navigate', { url: URL }); await waitFor('Nos professeurs', 60000); await waitImages(); await sleep(1500); };


  const P = process.env.PREFIX || 'avant';
  const scrollMain = (y) => evaluate(`(() => { const s=[...document.querySelectorAll('div')].filter(d=>d.scrollHeight>d.clientHeight+50 && getComputedStyle(d).overflowY!=='visible' && d.clientHeight > 500); s.forEach(d=>d.scrollTop = ${y}); return s.length })()`);
  const enter = async () => {
    await send('Page.navigate', { url: URL });
    await sleep(1500);
    await evaluate(`localStorage.setItem('onboarding_seen_v2','1'); true`);
    await send('Page.navigate', { url: URL });
    const t0 = Date.now();
    while (Date.now() - t0 < 120000) { const txt = String(await evaluate('document.body.innerText')); if (txt.includes('Nos professeurs') || txt.includes('Visiter sans compte')) break; await sleep(400); }
    if (String(await evaluate('document.body.innerText')).includes('Visiter sans compte')) await click('Visiter sans compte');
    await waitFor('Nos professeurs', 30000);
    await waitImages();
    await sleep(2000);
  };
  await step('home', async () => {
    await enter();
    await shot(P + '_01_accueil_haut');
    await scrollMain(800); await sleep(1200); await waitImages();
    await shot(P + '_02_accueil_milieu');
    await scrollMain(1600); await sleep(1200); await waitImages();
    await shot(P + '_03_accueil_bas');
  });
  await step('explorer', async () => {
    await scrollMain(0);
    await click('Explorer'); await sleep(3000); await waitImages();
    await shot(P + '_04_explorer');
  });
  await step('detail', async () => {
    await click('Mathématiques Brevet (BEPC)', { exact: false });
    await sleep(3000); await waitImages();
    await shot(P + '_05_fiche_cours');
    await scrollMain(700); await sleep(1000);
    await shot(P + '_06_fiche_cours_bas');
  });
  await step('mescours', async () => {
    await enter();
    await click('Mes cours'); await sleep(3000); await waitImages();
    await shot(P + '_07_mes_cours');
  });
  await step('live', async () => {
    await click('Live'); await sleep(3000); await waitImages();
    await shot(P + '_08_live');
  });
  await step('profil', async () => {
    await click('Profil'); await sleep(3000); await waitImages();
    await shot(P + '_09_profil');
  });
  await step('profs', async () => {
    await enter();
    await click('Voir tout'); await sleep(3000); await waitImages();
    await shot(P + '_10_professeurs');
  });
  await step('offre', async () => {
    await enter();
    await scrollMain(800); await sleep(800);
    await click('Pack complet'); await sleep(3000); await waitImages();
    await shot(P + '_11_offre');
  });
  await step('recherche', async () => {
    await enter();
    await click('Un cours, une matière, un prof…'); await sleep(2500);
    await shot(P + '_12_recherche');
  });

  ws.close();
  edge.kill();
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
