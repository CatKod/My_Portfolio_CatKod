import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const file = process.argv[2];
const ids = process.argv[3].split(',');
const html = readFileSync(file, 'utf8');
for (const p of splitFile(html)) {
  if (p.kind === 'raw') continue;
  for (const l of splitLines(p.text)) {
    if (ids.includes(l.id)) {
      console.log('=== id', l.id, 'len', l.body.length);
      console.log(l.body);
    }
  }
}
