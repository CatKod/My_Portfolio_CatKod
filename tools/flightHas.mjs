import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const html = readFileSync(process.argv[2], 'utf8');
const want = process.argv[3];
for (const p of splitFile(html)) {
  if (p.kind !== 'flight') continue;
  for (const l of splitLines(p.text)) {
    if (!l.id) continue;
    if (!l.body.includes(want)) continue;
    console.log(`id=${l.id} len=${l.body.length}`);
  }
}
