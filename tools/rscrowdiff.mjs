import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const route = process.argv[2] || '/guestbook';
const file = 'site' + (route === '/' ? '/index.html' : route);
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let flight = '';
for (const p of parts) if (p.kind === 'flight') flight += decodeFlight(p.text);

const r = await fetch('https://irfansabrian.vercel.app' + route + '?_rsc=full123', {
  headers: { RSC: '1', 'Next-Url': route },
});
const up = await r.text();

function rows(t) {
  const m = new Map();
  for (const line of t.split('\n')) {
    const mm = /^([\w$]+):/.exec(line);
    if (mm) m.set(mm[1], line);
  }
  return m;
}
const L = rows(flight), U = rows(up);
console.log('--- only in local ---');
for (const k of L.keys()) if (!U.has(k)) console.log(k, L.get(k).length);
console.log('--- only in upstream ---');
for (const k of U.keys()) if (!L.has(k)) console.log(k, U.get(k).length);
console.log('--- common, differing ---');
for (const [k, v] of L) {
  if (!U.has(k)) continue;
  if (U.get(k) === v) continue;
  console.log(k, 'L', v.length, 'U', U.get(k).length);
}
