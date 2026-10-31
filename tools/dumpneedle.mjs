import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const file = process.argv[2];
const needle = process.argv[3];
const html = readFileSync(file, 'utf8');
for (const p of splitFile(html)) {
  if (p.kind === 'raw') continue;
  for (const l of splitLines(p.text)) {
    const i = l.body.indexOf(needle);
    if (i >= 0) {
      console.log('id', l.id, 'len', l.body.length, 'at', i);
      console.log(l.body.slice(Math.max(0, i - 100), i + 900));
      console.log('---');
    }
  }
}
