import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const route = process.argv[2] || '/about';
const file = 'site' + (route === '/' ? '/index.html' : route);
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let flight = '';
for (const p of parts) if (p.kind === 'flight') flight += decodeFlight(p.text);

const r = await fetch('https://irfansabrian.vercel.app' + route + '?_rsc=full123', {
  headers: { RSC: '1', 'Next-Url': route },
});
const up = await r.text();

const L = flight.split('\n');
const U = up.split('\n');
console.log('L lines', L.length, 'U lines', U.length);
for (let i = 0; i < Math.max(L.length, U.length); i++) {
  if (L[i] === U[i]) continue;
  console.log('=== line', i, '===');
  // tìm điểm khác biệt đầu tiên
  const a = L[i] || '', b = U[i] || '';
  let k = 0;
  while (k < Math.min(a.length, b.length) && a[k] === b[k]) k++;
  console.log('diff at', k, 'lenL', a.length, 'lenU', b.length);
  console.log('L:', JSON.stringify(a.slice(Math.max(0, k - 100), k + 250)));
  console.log('U:', JSON.stringify(b.slice(Math.max(0, k - 100), k + 250)));
}
