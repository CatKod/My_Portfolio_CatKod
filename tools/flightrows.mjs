import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let flight = '';
for (const p of parts) if (p.kind === 'flight') flight += decodeFlight(p.text);

// Tách các dòng "id:[...]" ở cấp top-level
const rows = [];
let i = 0;
const lines = flight.split('\n');
for (const line of lines) {
  const m = /^([\w$]+):/.exec(line);
  if (m) rows.push({ id: m[1], len: line.length, text: line });
}
console.log('rows', rows.map(r => r.id + ':' + r.len).join(' '));
if (process.argv[3]) {
  for (const r of rows) {
    if (process.argv[3] === '*' || r.id === process.argv[3]) {
      console.log('=== ' + r.id + ' len ' + r.len + ' ===');
      console.log(r.text.slice(0, +(process.argv[4] || 2500)));
      console.log();
    }
  }
}
