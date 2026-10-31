import { readFileSync } from 'node:fs';

const file = process.argv[2];
const s = readFileSync(file, 'utf8');
const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
let flight = '';
for (const m of s.matchAll(re)) {
  try {
    flight += JSON.parse(m[1]);
  } catch {
    /* ignore */
  }
}
const rows = new Map();
for (const line of flight.split('\n')) {
  const m = line.match(/^([0-9a-f]+):(.*)$/);
  if (!m) continue;
  rows.set(m[1], m[2]);
}
for (const m of flight.matchAll(/\$L([0-9a-f]+)/g)) {
  const id = m[1];
  if (!rows.has(id)) {
    const ctx = flight.slice(Math.max(0, m.index - 120), m.index + 60).replace(/\n/g, '|');
    console.log('MISSING $L' + id, '::', ctx);
  }
}
console.log('--- row ids:', [...rows.keys()].join(','));
