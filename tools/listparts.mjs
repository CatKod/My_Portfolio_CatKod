import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const html = readFileSync(process.argv[2], 'utf8');
const parts = splitFile(html);
parts.forEach((p, i) => {
  if (p.kind !== 'flight') return;
  for (const l of splitLines(p.text)) {
    console.log(`part${i} id=${l.id} len=${l.body.length}`);
  }
});
