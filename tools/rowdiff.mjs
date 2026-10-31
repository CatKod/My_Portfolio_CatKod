import { readFileSync } from 'node:fs';

function flightOf(file) {
  const s = readFileSync(file, 'utf8');
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let out = '';
  for (const m of s.matchAll(re)) {
    try {
      out += JSON.parse(m[1]);
    } catch {
      /* ignore */
    }
  }
  return out;
}

function rows(file) {
  const map = new Map();
  for (const line of flightOf(file).split('\n')) {
    const m = line.match(/^([0-9a-f]+):(.*)$/);
    if (!m) continue;
    map.set(m[1], m[2]);
  }
  return map;
}

const a = rows(process.argv[2]);
const b = rows(process.argv[3]);
const ids = new Set([...a.keys(), ...b.keys()]);
for (const id of [...ids].sort()) {
  const x = a.get(id);
  const y = b.get(id);
  const sig = (v) => (v === undefined ? '(missing)' : v.slice(0, 110));
  if (x === y) continue;
  console.log('row', id);
  console.log('  ORIG', sig(x));
  console.log('  NEW ', sig(y));
}
