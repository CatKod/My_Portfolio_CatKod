import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let flight = '';
for (const p of parts) if (p.kind === 'flight') flight += decodeFlight(p.text);
const needle = process.argv[3];
let i = -1, c = 0;
while ((i = flight.indexOf(needle, i + 1)) !== -1) {
  c++;
  console.log('=== ' + c + ' @' + i + ' ===');
  console.log(flight.slice(Math.max(0, i - 250), i + 700));
  if (c > 3) break;
}
