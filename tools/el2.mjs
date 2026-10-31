import { readFileSync } from 'node:fs';
import { elementByClass, elementsByClass } from './dom.mjs';

const h = readFileSync(process.argv[2], 'utf8');
const cls = process.argv[3];
const el = elementByClass(h, cls);
if (!el) { console.log('NOT FOUND', cls); process.exit(1); }
console.log('len', el.length);
console.log(el.slice(0, Number(process.argv[4] || 3000)));
