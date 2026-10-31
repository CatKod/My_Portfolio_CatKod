import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
const ids = new Set();
const refs = new Set();
for (const p of splitFile(html)) {
  if (p.kind === 'raw') continue;
  for (const l of splitLines(p.text)) {
    ids.add(l.id);
    for (const m of l.body.matchAll(/\$L([0-9a-f]+)/g)) refs.add(m[1]);
    for (const m of l.body.matchAll(/\$@([0-9a-f]+)/g)) refs.add(m[1]);
  }
}
const orphans = [...ids].filter((i) => i && !refs.has(i));
console.log('defined:', [...ids].join(','));
console.log('referenced:', [...refs].join(','));
console.log('ORPHANS:', orphans.join(','));
