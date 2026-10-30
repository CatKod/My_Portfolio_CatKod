// Verify Next.js client-side routing behaves identically on local mirror vs upstream.
import WebSocket from 'file:///D:/GitHub/rea/node_modules/ws/index.js';

const CDP_HTTP = process.env.CDP_HTTP || 'http://127.0.0.1:9333';
const [localOrigin, upstreamOrigin] = process.argv.slice(2);

class Session {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map();
    ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error))); else resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('timeout ' + method)); } }, 90000);
    });
  }
}

async function newTab(url) {
  const res = await fetch(`${CDP_HTTP}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const target = await res.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
  await new Promise((r, j) => { ws.once('open', r); ws.once('error', j); });
  const s = new Session(ws);
  s.targetId = target.id;
  return s;
}

const ROUTES = ['/about', '/work', '/skills', '/credentials', '/guestbook', '/contact'];

async function run(origin) {
  const s = await newTab(origin + '/');
  await s.send('Page.enable'); await s.send('Runtime.enable');
  await s.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await s.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await s.send('Page.navigate', { url: origin + '/' });
  await new Promise((resolve) => {
    const t = setTimeout(resolve, 30000);
    const h = (raw) => { const m = JSON.parse(raw.toString()); if (m.method === 'Page.loadEventFired') { clearTimeout(t); s.ws.off('message', h); resolve(); } };
    s.ws.on('message', h);
  });
  await s.send('Runtime.evaluate', { expression: `new Promise(r => setTimeout(r, 3000))`, awaitPromise: true, returnByValue: true });

  const results = [];
  for (const route of ROUTES) {
    // click the nav link for this route (client-side navigation)
    const clicked = await s.send('Runtime.evaluate', {
      expression: `(() => {
        const a = Array.from(document.querySelectorAll('a[href="${route}"]')).find(x => x.offsetParent !== null);
        if (!a) return 'nolink';
        a.click();
        return 'clicked';
      })()`,
      returnByValue: true,
    });
    await s.send('Runtime.evaluate', { expression: `new Promise(r => setTimeout(r, 3500))`, awaitPromise: true, returnByValue: true });
    const st = await s.send('Runtime.evaluate', {
      expression: `JSON.stringify({
        path: location.pathname,
        title: document.title,
        h1: (document.querySelector('h1') || {}).textContent || '',
        textLen: document.body.innerText.length,
        h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()).slice(0, 8),
        navActive: Array.from(document.querySelectorAll('nav a[aria-current="page"]')).map(a => a.getAttribute('href')),
      })`,
      returnByValue: true,
    });
    results.push({ route, clicked: clicked.result.value, ...JSON.parse(st.result.value) });
  }
  await fetch(`${CDP_HTTP}/json/close/${s.targetId}`);
  return results;
}

const local = await run(localOrigin);
const upstream = await run(upstreamOrigin);

let ok = true;
for (let i = 0; i < local.length; i++) {
  const l = local[i], u = upstream[i];
  const same = l.path === u.path && l.title === u.title && l.h1 === u.h1 && l.textLen === u.textLen
    && JSON.stringify(l.h2) === JSON.stringify(u.h2) && JSON.stringify(l.navActive) === JSON.stringify(u.navActive);
  if (!same) ok = false;
  console.log((same ? 'MATCH ' : 'DIFF  ') + l.route);
  if (!same) {
    console.log('  local   :', JSON.stringify(l));
    console.log('  upstream:', JSON.stringify(u));
  } else {
    console.log('  path=' + l.path + ' title="' + l.title + '" h1="' + l.h1.slice(0, 50) + '" textLen=' + l.textLen);
  }
}
console.log(ok ? 'ALL ROUTES MATCH' : 'SOME ROUTES DIFFER');
