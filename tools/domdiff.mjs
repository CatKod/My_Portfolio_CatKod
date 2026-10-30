// Structural DOM diff between local mirror and upstream for one route.
import WebSocket from 'file:///D:/GitHub/rea/node_modules/ws/index.js';

const CDP_HTTP = process.env.CDP_HTTP || 'http://127.0.0.1:9333';
const [localOrigin, upstreamOrigin, route] = process.argv.slice(2);

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

async function newTab(url) {
  const res = await fetch(`${CDP_HTTP}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const target = await res.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
  await new Promise((r, j) => { ws.once('open', r); ws.once('error', j); });
  return new Session(ws);
}

const SNAP = `(() => {
  const walk = (el, depth) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const node = {
      d: depth, tag: el.tagName.toLowerCase(),
      cls: (el.className && typeof el.className === 'string') ? el.className : '',
      x: Math.round(r.x + window.scrollX), y: Math.round(r.y + window.scrollY),
      w: Math.round(r.width), h: Math.round(r.height),
      txt: (el.children.length === 0 ? (el.textContent || '').trim().slice(0, 120) : ''),
      fs: cs.fontSize, fw: cs.fontWeight, ff: cs.fontFamily.slice(0, 40),
      col: cs.color, bg: cs.backgroundColor, op: cs.opacity,
    };
    const out = [node];
    for (const c of el.children) out.push(...walk(c, depth + 1));
    return out;
  };
  return JSON.stringify(walk(document.body, 0));
})()`;

async function snap(url) {
  const s = await newTab('about:blank');
  await s.send('Page.enable');
  await s.send('Runtime.enable');
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
      await new Promise(r => setTimeout(r, 2000)); return true; })()`,
    awaitPromise: true, returnByValue: true,
  });
  const r = await s.send('Runtime.evaluate', { expression: SNAP, returnByValue: true });
  const extra = await s.send('Runtime.evaluate', { expression: `JSON.stringify({
    title: document.title,
    bodyText: document.body.innerText,
    imgs: Array.from(document.images).map(i => ({ src: i.currentSrc || i.src, nw: i.naturalWidth, nh: i.naturalHeight, w: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height) })),
    scrollH: document.documentElement.scrollHeight,
  })`, returnByValue: true });
  const t = s.ws;
  return { dom: JSON.parse(r.result.value), extra: JSON.parse(extra.result.value) };
}

const a = await snap(localOrigin + route);
const b = await snap(upstreamOrigin + route);

console.log('TITLE local :', a.extra.title);
console.log('TITLE upstre :', b.extra.title);
console.log('scrollH     :', a.extra.scrollH, 'vs', b.extra.scrollH);
console.log('bodyText eq :', a.extra.bodyText === b.extra.bodyText, '(len', a.extra.bodyText.length, 'vs', b.extra.bodyText.length, ')');
console.log('dom nodes   :', a.dom.length, 'vs', b.dom.length);

const max = Math.max(a.dom.length, b.dom.length);
let diffs = 0;
for (let i = 0; i < max; i++) {
  const x = a.dom[i], y = b.dom[i];
  if (!x || !y) { console.log('MISSING node at', i, JSON.stringify(x || y)); diffs++; continue; }
  const keys = ['d','tag','cls','x','y','w','h','txt','fs','fw','col','bg','op'];
  const bad = keys.filter(k => String(x[k]) !== String(y[k]));
  if (bad.length) {
    diffs++;
    if (diffs <= 25) console.log('DIFF[' + i + ']', bad.map(k => `${k}: "${x[k]}" != "${y[k]}"`).join(' | '));
  }
}
console.log('total differing nodes:', diffs);

if (a.extra.bodyText !== b.extra.bodyText) {
  const la = a.extra.bodyText.split('\n'), lb = b.extra.bodyText.split('\n');
  for (let i = 0; i < Math.max(la.length, lb.length); i++) {
    if (la[i] !== lb[i]) console.log('TEXTDIFF line', i, JSON.stringify(la[i]), '!=', JSON.stringify(lb[i]));
  }
}
console.log('IMGS local:', JSON.stringify(a.extra.imgs));
console.log('IMGS upstr:', JSON.stringify(b.extra.imgs));
