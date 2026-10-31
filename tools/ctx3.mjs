import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const file = process.argv[2];
const needle = process.argv[3];
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let dom = '';
for (const p of parts) if (p.kind === 'raw') dom += p.text;
const i = dom.indexOf(needle);
if (i < 0) { console.log('NOT FOUND in dom'); process.exit(1); }
console.log(dom.slice(Math.max(0, i - (process.argv[4] ? +process.argv[4] : 400)), i + (process.argv[5] ? +process.argv[5] : 600)));
