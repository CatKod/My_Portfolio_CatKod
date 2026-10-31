import { readFileSync } from 'node:fs';
import { splitFile } from './flight.mjs';

const html = readFileSync(process.argv[2], 'utf8');
const parts = splitFile(html);
const needle = process.argv[3] || '"projects":[';
let n = 0;
parts.forEach((p, i) => {
  if (p.kind !== 'flight') return;
  let k = p.text.indexOf(needle);
  while (k >= 0) {
    n++;
    console.log('part', i, 'idx', k, 'len', p.text.length);
    k = p.text.indexOf(needle, k + 1);
  }
});
console.log('total', n);
