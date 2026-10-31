import { readFileSync, writeFileSync } from 'node:fs';

const h = readFileSync(process.argv[2], 'utf8');
const start = process.argv[3];
const end = process.argv[4];
const out = process.argv[5];

const s = h.indexOf(start);
const e = h.indexOf(end, s);
if (s < 0 || e < 0) { console.log('NOT FOUND'); process.exit(1); }
writeFileSync(out, h.slice(s, e + end.length));
console.log('wrote', out);
