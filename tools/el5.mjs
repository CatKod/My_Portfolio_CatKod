import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';
import { elementsByClass, balancedFrom } from './dom.mjs';

const file = process.argv[2];
const cls = process.argv[3];
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let dom = '';
for (const p of parts) if (p.kind === 'raw') dom += p.text;
const els = elementsByClass(dom, cls);
console.log('count', els.length);
const limit = +(process.argv[4] || 2);
for (let i = 0; i < Math.min(limit, els.length); i++) {
  console.log('=== element ' + i + ' len ' + els[i].length + ' ===');
  console.log(els[i].slice(0, +(process.argv[5] || 1200)));
}
