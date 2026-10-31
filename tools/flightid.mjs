import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const file = process.argv[2];
const id = process.argv[3];
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let flight = '';
for (const p of parts) if (p.kind === 'flight') flight += decodeFlight(p.text);
const re = new RegExp('(?:^|\\n)' + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':', 'm');
const m = re.exec(flight);
if (!m) { console.log('not found'); process.exit(1); }
const start = m.index + (m[0].startsWith('\n') ? 1 : 0);
const bodyStart = flight.indexOf('[', start);
console.log('id', id, 'at', start, 'bodyLen', bodyStart - start);
console.log(flight.slice(start, bodyStart + 3000));
