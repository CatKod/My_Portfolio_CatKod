import { readFileSync } from 'node:fs';
import { splitFlight } from './transform.mjs';
import { elementsByClass } from './dom.mjs';

const file = process.argv[2];
const cls = process.argv[3];
const html = readFileSync(file, 'utf8');
const dom = splitFlight(html).filter((p) => p.kind === 'raw').map((p) => p.text).join('');
const els = elementsByClass(dom, cls);
console.log(`--- ${cls}: ${els.length}`);
els.forEach((el, i) => console.log(`\n[${i}]\n${el}`));
