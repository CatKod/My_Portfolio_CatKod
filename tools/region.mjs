// Dump elements inside a viewport region for one URL, with computed styles.
import WebSocket from 'file:///D:/GitHub/rea/node_modules/ws/index.js';

const CDP_HTTP = process.env.CDP_HTTP || 'http://127.0.0.1:9333';
const [url, x0, y0, x1, y1] = process.argv.slice(2);

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
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('timeout ' + method)); } }, 120000);
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
  const t = setTimeout(resolve, 40000);
  const h = (raw) => { const m = JSON.parse(raw.toString()); if (m.method === 'Page.loadEventFired') { clearTimeout(t); s.ws.off('message', h); resolve(); } };
  s.ws.on('message', h);
});
await s.send('Runtime.evaluate', {
  expression: `(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const imgs = Array.from(document.images).filter(i => !i.complete);
    await Promise.race([Promise.all(imgs.map(i => new Promise(r => { i.onload = i.onerror = r; }))), new Promise(r => setTimeout(r, 12000))]);
    await new Promise(r => setTimeout(r, 2500)); return true; })()`,
  awaitPromise: true, returnByValue: true,
});

const expr = `(() => {
  const X0=${x0}, Y0=${y0}, X1=${x1}, Y1=${y1};
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    if (el.closest('.skiptranslate, [class^="VIpgJd"]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right < X0 || r.left > X1 || r.bottom < Y0 || r.top > Y1) continue;
    const cs = getComputedStyle(el);
    out.push({
      tag: el.tagName.toLowerCase(), cls: (typeof el.className === 'string' ? el.className : '').slice(0, 80),
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
      txt: (el.children.length === 0 ? (el.textContent || '').trim().slice(0, 80) : ''),
      bg: cs.backgroundColor, bgImg: cs.backgroundImage.slice(0, 100), op: cs.opacity,
      tr: cs.transform, filt: cs.filter, mix: cs.mixBlendMode,
      src: el.tagName === 'IMG' ? (el.currentSrc || el.src) : '',
      nw: el.tagName === 'IMG' ? el.naturalWidth : null,
      anim: cs.animationName + ' ' + cs.animationDuration,
    });
  }
  return JSON.stringify(out, null, 1);
})()`;
const r = await s.send('Runtime.evaluate', { expression: expr, returnByValue: true });
console.log(r.result.value);
await fetch(`${CDP_HTTP}/json/close/${target.id}`);
