import WebSocket from 'file:///D:/GitHub/rea/node_modules/ws/index.js';

const CDP_HTTP = process.env.CDP_HTTP || 'http://127.0.0.1:9333';
const url = process.argv[2];

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
await s.send('Page.enable'); await s.send('Runtime.enable'); await s.send('Network.enable');
await s.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await s.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

const failures = [];
s.ws.on('message', (raw) => {
  const m = JSON.parse(raw.toString());
  if (m.method === 'Network.loadingFailed') failures.push(m.params);
  if (m.method === 'Network.responseReceived' && /hero|\.png/.test(m.params.response.url)) {
    console.log('RESP', m.params.response.status, m.params.response.url, 'len', m.params.response.encodedDataLength, 'from', m.params.response.fromDiskCache, m.params.response.fromPrefetchCache);
  }
});

await s.send('Page.navigate', { url });
await new Promise((resolve) => {
  const t = setTimeout(resolve, 30000);
  const h = (raw) => { const m = JSON.parse(raw.toString()); if (m.method === 'Page.loadEventFired') { clearTimeout(t); s.ws.off('message', h); resolve(); } };
  s.ws.on('message', h);
});
await s.send('Runtime.evaluate', {
  expression: `(async () => { await new Promise(r => setTimeout(r, 6000)); return true; })()`,
  awaitPromise: true, returnByValue: true,
});
const r = await s.send('Runtime.evaluate', {
  expression: `JSON.stringify(Array.from(document.images).map(i => ({ src: (i.currentSrc||i.src).split('/').pop(), complete: i.complete, nw: i.naturalWidth, nh: i.naturalHeight, cw: i.clientWidth, ch: i.clientHeight })))`,
  returnByValue: true,
});
console.log('IMGS', r.result.value);
console.log('FAILURES', JSON.stringify(failures).slice(0, 1000));
await fetch(`${CDP_HTTP}/json/close/${target.id}`);
