import WebSocket from 'file:///D:/GitHub/rea/node_modules/ws/index.js';

const CDP_HTTP = process.env.CDP_HTTP || 'http://127.0.0.1:9333';
const [url, px, py] = process.argv.slice(2);

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
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('timeout ' + method)); } }, 60000);
    });
  }
}

const res = await fetch(`${CDP_HTTP}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
const target = await res.json();
const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
await new Promise((r, j) => { ws.once('open', r); ws.once('error', j); });
const s = new Session(ws);
await s.send('Page.enable'); await s.send('Runtime.enable');
await s.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await s.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await s.send('Page.navigate', { url });
await new Promise((resolve) => {
  const t = setTimeout(resolve, 30000);
  const h = (raw) => { const m = JSON.parse(raw.toString()); if (m.method === 'Page.loadEventFired') { clearTimeout(t); s.ws.off('message', h); resolve(); } };
  s.ws.on('message', h);
});
await s.send('Runtime.evaluate', {
  expression: `(async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y < H; y += 600) { window.scrollTo(0, y); await sleep(120); }
    window.scrollTo(0, 0); await sleep(2000);
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await sleep(2000); return true; })()`,
  awaitPromise: true, returnByValue: true,
});

const expr = `(() => {
  const el = document.elementsFromPoint(${px}, ${py})[0];
  const chain = [];
  let e = el;
  while (e && e !== document.documentElement) {
    const cs = getComputedStyle(e);
    const r = e.getBoundingClientRect();
    chain.push({
      tag: e.tagName.toLowerCase(),
      cls: (typeof e.className === 'string' ? e.className : '').slice(0, 70),
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      filter: cs.filter, mix: cs.mixBlendMode, op: cs.opacity, bg: cs.backgroundColor,
      bgImg: cs.backgroundImage.slice(0, 120), bgSize: cs.backgroundSize, bgPos: cs.backgroundPosition,
      mask: (cs.maskImage || cs.webkitMaskImage || 'none').slice(0, 100),
      clip: cs.clipPath, transform: cs.transform, isolation: cs.isolation, blend: cs.mixBlendMode,
    });
    e = e.parentElement;
  }
  return JSON.stringify(chain, null, 1);
})()`;
const r = await s.send('Runtime.evaluate', { expression: expr, returnByValue: true });
console.log(r.result.value);
await fetch(`${CDP_HTTP}/json/close/${target.id}`);
