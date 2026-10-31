import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const html = readFileSync('site.orig.bak/work', 'utf8');
for (const p of splitFile(html)) {
  if (p.kind === 'raw') continue;
  for (const l of splitLines(p.text)) {
    const i = l.body.indexOf('"projects":');
    if (i >= 0) {
      console.log(`### id=${l.id} len=${l.body.length}`);
      console.log(l.body.slice(i, i + 3000));
      console.log('...');
    }
  }
}
