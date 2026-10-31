import { readFileSync } from 'node:fs';
import { splitFile } from './flight.mjs';

const file = process.argv[2];
const parts = splitFile(readFileSync(file, 'utf8'));
let flight = '';
for (const p of parts) if (p.kind === 'flight') flight += p.text;

const rows = new Map();
for (const line of flight.split('\n')) {
  const ci = line.indexOf(':');
  if (ci < 0) continue;
  rows.set(line.slice(0, ci), line.slice(ci + 1));
}
for (const [id, body] of rows) {
  console.log('---', id, body.slice(0, 400));
}
