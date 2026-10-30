// elementsFromPoint probe for a grid of coordinates
import WebSocket from 'file:///D:/GitHub/rea/node_modules/ws/index.js';

const CDP_HTTP = process.env.CDP_HTTP || 'http://127.0.0.1:9333';
const [url, x0, y0, x1, y1] = process.argv.slice(2);
const X0 = +x0, Y0 = +y0, X1 = +x1, Y1 = +y1;

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
  expression: `(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await new Promise(r => setTimeout(r, 3000)); return true; })()`,
  awaitPromise: true, returnByValue: true,
});
const expr = `(() => {
  const rows = [];
  for (let y = ${Y0}; y <= ${Y1}; y += 20) {
    for (let x = ${X0}; x <= ${X1}; x += 40) {
      const els = document.elementsFromPoint(x, y).filter(e => !e.closest('.skiptranslate, [class^="VIpgJd"]'));
      if (!els.length) continue;
      const e = els[0];
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      rows.push({x,y,tag:e.tagName.toLowerCase(),cls:(typeof e.className==='string'?e.className:'').slice(0,60),
        txt:(e.children.length===0?(e.textContent||'').trim().slice(0,40):''),
        rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
        bg:cs.backgroundColor,bgImg:cs.backgroundImage.slice(0,80),op:cs.opacity,filt:cs.filter,blend:cs.mixBlendMode,
        src:e.tagName==='IMG'?(e.currentSrc||e.src):''});
    }
  }
  return JSON.stringify(rows);
})()`;
const r = await s.send('Runtime.evaluate', { expression: expr, returnByValue: true });
if (r.exceptionDetails) {
  console.error('EXC', JSON.stringify(r.exceptionDetails).slice(0, 1500));
} else {
  console.log(r.result.value);
}
await fetch(`${CDP_HTTP}/json/close/${target.id}`);
