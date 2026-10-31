import { readFileSync } from 'node:fs';
import { splitFile } from './flight.mjs';

const html = readFileSync(process.argv[2], 'utf8');
const dom = splitFile(html)
  .filter((p) => p.kind === 'raw')
  .map((p) => p.text)
  .join('');
const seen = new Map();
for (const m of dom.matchAll(/class="([^"]+)"/g)) {
  for (const c of m[1].split(/\s+/)) {
    if (!c) continue;
    seen.set(c, (seen.get(c) || 0) + 1);
  }
}
console.log([...seen.entries()].map(([c, n]) => `${c}(${n})`).join(' '));
