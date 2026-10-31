import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let flight = '';
for (const p of parts) if (p.kind === 'flight') flight += decodeFlight(p.text);
const needle = process.argv[3];
const all = [];
let i = -1;
while ((i = flight.indexOf(needle, i + 1)) !== -1) all.push(i);
console.log('count', all.length, 'positions', all.slice(0, 20).join(','));
const idx = all[+(process.argv[4] || 0)];
if (idx === undefined) process.exit(1);
console.log('---');
console.log(flight.slice(Math.max(0, idx - 800), idx + 1200));
