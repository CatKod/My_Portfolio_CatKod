// Compare the local Kotlin mirror against the upstream original using REA.
//   node tools/compare.mjs <localOrigin> <upstreamOrigin> <route1,route2,...>
import WebSocket from 'file:///D:/GitHub/rea/node_modules/ws/index.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const CDP_HTTP = process.env.CDP_HTTP || 'http://127.0.0.1:9333';
const [localOrigin, upstreamOrigin, routeList] = process.argv.slice(2);
const routes = (routeList || '/').split(',').filter(Boolean);
const WIDTH = 1440;
const HEIGHT = 900;

mkdirSync('shots', { recursive: true });

class Session {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error('timeout ' + method));
        }
      }, 180000);
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

async function closeTab(s) {
  try { s.ws.close(); } catch { /* ignore */ }
  await fetch(`${CDP_HTTP}/json/close/${s.targetId}`);
}

async function prepare(s, url) {
  await s.send('Page.enable');
  await s.send('Runtime.enable');
  await s.send('Emulation.setDeviceMetricsOverride', {
    width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false,
  });
  await s.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  await s.send('Page.navigate', { url });
  await new Promise((resolve) => {
    const t = setTimeout(resolve, 45000);
    const handler = (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.method === 'Page.loadEventFired') {
        clearTimeout(t);
        s.ws.off('message', handler);
        resolve();
      }
    };
    s.ws.on('message', handler);
  });
  await s.send('Runtime.evaluate', {
    expression: `(async () => {
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));
      // scroll through the page so lazy-loaded images start fetching
      const H = document.documentElement.scrollHeight;
      for (let y = 0; y < H; y += 600) { window.scrollTo(0, y); await sleep(120); }
      window.scrollTo(0, 0);
      await sleep(200);
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const deadline = Date.now() + 20000;
      while (Date.now() < deadline) {
        const pending = Array.from(document.images).filter(i => !i.complete || i.naturalWidth === 0);
        if (!pending.length) break;
        await Promise.race([
          Promise.all(pending.map(i => new Promise(r => { i.onload = i.onerror = r; }))),
          sleep(1500),
        ]);
      }
      await sleep(1500);
      for (const i of document.images) { try { await i.decode(); } catch (e) { /* ignore */ } }
      await sleep(1500);
      return Array.from(document.images).filter(i => !i.complete).length;
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
}

function reaCapture(targetId, allowedOrigins) {
  const out = execFileSync('rea', [
    'capture-web-screenshot', CDP_HTTP, targetId,
    '--allowed-origins', allowedOrigins,
    '--format', 'json',
  ], { encoding: 'utf8', shell: true, maxBuffer: 256 * 1024 * 1024 });
  const json = JSON.parse(out.trim().split('\n').filter(Boolean).pop());
  if (!json.normalized_result?.artifact) {
    throw new Error('capture failed: ' + JSON.stringify(json).slice(0, 400));
  }
  return json.normalized_result.artifact;
}

const summary = [];
for (const route of routes) {
  const local = await newTab('about:blank');
  const upstream = await newTab('about:blank');
  try {
    await prepare(local, localOrigin + route);
    await prepare(upstream, upstreamOrigin + route);
    const a = reaCapture(local.targetId, localOrigin);
    const b = reaCapture(upstream.targetId, upstreamOrigin);
    const key = route.replace(/[^a-z0-9]/gi, '_') || 'root';
    writeFileSync(`shots/${key}_local.png`, Buffer.from(a.data_base64, 'base64'));
    writeFileSync(`shots/${key}_upstream.png`, Buffer.from(b.data_base64, 'base64'));
    writeFileSync(`shots/${key}_local.json`, JSON.stringify(a));
    writeFileSync(`shots/${key}_upstream.json`, JSON.stringify(b));
    const cmp = JSON.parse(execFileSync('rea', [
      'compare-web-screenshots', `shots/${key}_local.json`, `shots/${key}_upstream.json`,
      '--format', 'json',
    ], { encoding: 'utf8', shell: true, maxBuffer: 64 * 1024 * 1024 })
      .trim().split('\n').filter(Boolean).pop());
    const n = cmp.normalized_result || {};
    summary.push({
      route,
      changed_pixels: n.changed_pixels ?? n.changed ?? null,
      total_pixels: n.total_pixels ?? null,
      similarity: n.similarity ?? n.match_ratio ?? null,
      verdict: n.verdict ?? n.status ?? null,
      raw: n,
    });
    console.log(route, JSON.stringify(summary[summary.length - 1].raw).slice(0, 400));
  } finally {
    await closeTab(local);
    await closeTab(upstream);
  }
}

writeFileSync('shots/summary.json', JSON.stringify(summary, null, 2));
console.log('DONE');
