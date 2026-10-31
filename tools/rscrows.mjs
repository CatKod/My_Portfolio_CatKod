import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const route = process.argv[2] || '/about';
const file = 'site' + (route === '/' ? '/index.html' : route);
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let flight = '';
for (const p of parts) if (p.kind === 'flight') flight += decodeFlight(p.text);

const r = await fetch('https://irfansabrian.vercel.app' + route + '?_rsc=xyz789', {
  headers: { RSC: '1', 'Next-Url': route },
});
const up = await r.text();

function toRows(text) {
  const map = new Map();
  for (const line of text.split('\n')) {
    const m = /^([\w$]+):/.exec(line);
    if (m) map.set(m[1], line.slice(m[1].length + 1));
  }
  return map;
}
const L = toRows(flight);
const U = toRows(up);
console.log('local ids', L.size, 'up ids', U.size);
const onlyL = [...L.keys()].filter(k => !U.has(k));
const onlyU = [...U.keys()].filter(k => !L.has(k));
console.log('only local', onlyL.join(','));
console.log('only up', onlyU.join(','));
let same = 0, diff = 0;
for (const [k, v] of L) {
  if (!U.has(k)) continue;
  if (U.get(k) === v) same++;
  else { diff++; console.log('DIFF', k, 'lenL', v.length, 'lenU', U.get(k).length); }
}
console.log('identical rows', same, 'different', diff);
