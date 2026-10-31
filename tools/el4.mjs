import { readFileSync, writeFileSync } from 'node:fs';
import { elementByClass } from './dom.mjs';

const h = readFileSync(process.argv[2], 'utf8');
const el = elementByClass(h, process.argv[3]);
if (!el) { console.log('NOT FOUND'); process.exit(1); }
writeFileSync(process.argv[4] || 'tmp_el.html', el);
console.log('LEN', el.length);
console.log(el.slice(0, Number(process.argv[5] || 1500)));
