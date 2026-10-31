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

const refs = new Map();
for (const m of flight.matchAll(/\$L([0-9a-f]+)/g)) {
  if (!refs.has(m[1])) refs.set(m[1], 0);
  refs.set(m[1], refs.get(m[1]) + 1);
}

console.log('rows:', rows.size);
const missing = [...refs.keys()].filter((id) => !rows.has(id));
console.log('refs:', refs.size);
console.log('MISSING refs:', missing.map((id) => id + ' x' + refs.get(id)).join(', ') || '(none)');
console.log('unreferenced rows:', [...rows.keys()].filter((id) => !refs.has(id)).join(', ') || '(none)');
