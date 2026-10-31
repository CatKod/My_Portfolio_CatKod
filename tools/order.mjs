import { readFileSync } from 'node:fs';
import { splitFlight } from './transform.mjs';

const html = readFileSync(process.argv[2], 'utf8');
const dom = splitFlight(html).filter((p) => p.kind === 'raw').map((p) => p.text).join('');
const i = dom.indexOf('credentials-board');
const seg = dom.slice(i, i + 30000);
const order = [...seg.matchAll(/class="(credential[a-z-]*|credentials[a-z-]*)/g)].map((m) => m[1]);
console.log([...new Set(order)].join('\n'));
