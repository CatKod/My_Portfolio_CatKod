import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const file = process.argv[2] || 'site.orig.bak/index.html';
const needle = process.argv[3] || 'rotating';
const html = readFileSync(file, 'utf8');
for (const p of splitFile(html)) {
  if (p.kind === 'raw') continue;
  for (const l of splitLines(p.text)) {
    const i = l.body.indexOf(needle);
    if (i >= 0) {
      console.log(`### id=${l.id} len=${l.body.length}`);
      console.log(l.body.slice(Math.max(0, i - 800), i + 1200));
      console.log('---');
    }
  }
}
