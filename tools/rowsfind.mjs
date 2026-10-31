import { readFileSync } from 'node:fs';

const file = process.argv[2];
const s = readFileSync(file, 'utf8');
const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
let flight = '';
for (const m of s.matchAll(re)) flight += JSON.parse('"' + m[1] + '"');

const rows = new Map();
for (const line of flight.split('\n')) {
  const ci = line.indexOf(':');
  if (ci < 0) continue;
  rows.set(line.slice(0, ci), line.slice(ci + 1));
}
for (const [id, body] of rows) {
  if (/projects|\"slug\"|title/.test(body)) console.log('---', id, body.slice(0, 700));
}
