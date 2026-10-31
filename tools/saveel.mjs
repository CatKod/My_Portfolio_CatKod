import { readFileSync, writeFileSync } from 'node:fs';
import { splitFlight } from './transform.mjs';
import { findByClass, balancedFrom } from './dom.mjs';

const file = process.argv[2];
const cls = process.argv[3];
const out = process.argv[4];
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let dom = '';
for (const p of parts) if (p.kind === 'raw') dom += p.text;
const start = findByClass(dom, cls);
if (start < 0) { console.log('not found'); process.exit(1); }
const el = balancedFrom(dom, start);
writeFileSync(out, el, 'utf8');
console.log('wrote', out, el.length, 'opens', (el.match(/<[a-z]/gi) || []).length);
