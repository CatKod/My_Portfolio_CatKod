import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const html = readFileSync('site.orig.bak/credentials', 'utf8');
for (const p of splitFile(html)) {
  if (p.kind !== 'flight') continue;
  for (const l of splitLines(p.text)) {
    if (l.id === '23') {
      console.log(l.body.slice(0, 6000));
    }
  }
}
