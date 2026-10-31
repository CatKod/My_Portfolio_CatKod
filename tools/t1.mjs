import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const html = readFileSync(process.argv[2], 'utf8');
const parts = splitFlight(html);
const d = decodeFlight(parts[17].text);
console.log('tail:', JSON.stringify(d.slice(-400)));
const idx = d.indexOf('$L25');
console.log('index of $L25:', idx, idx >= 0 ? JSON.stringify(d.slice(idx - 30, idx + 30)) : '');
console.log('regex hits:', [...d.matchAll(/\$L(\w+)/g)].map((m) => m[1]).join(','));
