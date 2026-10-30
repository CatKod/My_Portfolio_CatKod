// Canvas-based pixel diff of two PNGs, run inside the dedicated Chrome instance.
//   node tools/pixdiff.mjs <localPng> <upstreamPng> <outPng>
import WebSocket from 'file:///D:/GitHub/rea/node_modules/ws/index.js';
import { writeFileSync, readFileSync } from 'node:fs';

const CDP_HTTP = process.env.CDP_HTTP || 'http://127.0.0.1:9333';
const [aPath, bPath, outPath] = process.argv.slice(2);

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

const res = await fetch(`${CDP_HTTP}/json/new?about:blank`, { method: 'PUT' });
const target = await res.json();
const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
await new Promise((r, j) => { ws.once('open', r); ws.once('error', j); });
const s = new Session(ws);
await s.send('Page.enable');
await s.send('Runtime.enable');

const expr = `(async () => {
  const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const A = await load(${JSON.stringify('file:///' + aPath.replace(/\\\\/g, '/'))});
  const B = await load(${JSON.stringify('file:///' + bPath.replace(/\\\\/g, '/'))});
  const W = Math.min(A.width, B.width), H = Math.min(A.height, B.height);
  const ca = new OffscreenCanvas(W, H), cb = new OffscreenCanvas(W, H);
  const xa = ca.getContext('2d'), xb = cb.getContext('2d');
  xa.drawImage(A, 0, 0); xb.drawImage(B, 0, 0);
  const da = xa.getImageData(0, 0, W, H).data, db = xb.getImageData(0, 0, W, H).data;
  const out = xa.createImageData(W, H);
  let changed = 0, minX = W, minY = H, maxX = -1, maxY = -1;
  const rows = {};
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const d = Math.abs(da[i]-db[i]) + Math.abs(da[i+1]-db[i+1]) + Math.abs(da[i+2]-db[i+2]);
      if (d > 0) {
        changed++;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        rows[y] = (rows[y] || 0) + 1;
        out.data[i] = 255; out.data[i+1] = 0; out.data[i+2] = 0; out.data[i+3] = 255;
      } else {
        const g = (da[i]*0.3 + da[i+1]*0.59 + da[i+2]*0.11) * 0.35 + 160;
        out.data[i] = out.data[i+1] = out.data[i+2] = g; out.data[i+3] = 255;
      }
    }
  }
  xa.putImageData(out, 0, 0);
  const blob = await ca.convertToBlob({ type: 'image/png' });
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = ''; for (const b of buf) bin += String.fromCharCode(b);
  return JSON.stringify({
    width: W, height: H, changed, total: W * H,
    bbox: maxX < 0 ? null : { minX, minY, maxX, maxY },
    hotRows: Object.entries(rows).sort((p,q)=>q[1]-p[1]).slice(0, 12),
    png_b64: btoa(bin),
  });
})()`;

const r = await s.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
if (r.exceptionDetails) {
  console.error(JSON.stringify(r.exceptionDetails).slice(0, 2000));
  process.exit(1);
}
const out = JSON.parse(r.result.value);
writeFileSync(outPath, Buffer.from(out.png_b64, 'base64'));
delete out.png_b64;
console.log(JSON.stringify(out, null, 2));
await fetch(`${CDP_HTTP}/json/close/${target.id}`);
