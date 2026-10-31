import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const html = readFileSync(process.argv[2], 'utf8');
const needle = process.argv[3];
splitFlight(html).forEach((p, i) => {
  if (p.kind !== 'flight') return;
  const d = decodeFlight(p.text);
  let idx = d.indexOf(needle);
  if (idx === -1) return;
  let n = 0;
  while (idx !== -1 && n < 3) {
    n++;
    console.log(`\n=== chunk#${i} hit#${n} @${idx} ===`);
    console.log(d.slice(Math.max(0, idx - 600), Math.min(d.length, idx + 900)));
    idx = d.indexOf(needle, idx + needle.length);
  }
});
