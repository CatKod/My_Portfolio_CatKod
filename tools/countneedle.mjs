import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const file = process.argv[2];
const needle = process.argv[3];
const html = readFileSync(file, 'utf8');
for (const p of splitFile(html)) {
  if (p.kind === 'raw') continue;
  for (const l of splitLines(p.text)) {
    let i = l.body.indexOf(needle);
    while (i >= 0) {
      console.log(`part${p.index} id=${l.id} @${i} len=${l.body.length}`);
      console.log('  ...', JSON.stringify(l.body.slice(Math.max(0, i - 60), i + 100)));
      i = l.body.indexOf(needle, i + 1);
    }
  }
}
