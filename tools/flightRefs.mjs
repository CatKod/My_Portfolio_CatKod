import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
const chunks = splitFlight(html)
  .map((p, i) => ({ i, kind: p.kind, text: p.kind === 'flight' ? decodeFlight(p.text) : p.text }));

const defined = new Map(); // id -> chunk index
for (const c of chunks) {
  if (c.kind !== 'flight') continue;
  for (const m of c.text.matchAll(/^(\w+):/gm)) {
    if (!defined.has(m[1])) defined.set(m[1], c.i);
  }
}

const referenced = new Map(); // id -> Set(chunk index)
for (const c of chunks) {
  if (c.kind !== 'flight') continue;
  for (const m of c.text.matchAll(/\$L(\w+)/g)) {
    if (!referenced.has(m[1])) referenced.set(m[1], new Set());
    referenced.get(m[1]).add(c.i);
  }
}

console.log('ID\tDEFINED_IN\tREFERENCED_FROM');
for (const [id, di] of defined) {
  const refs = [...(referenced.get(id) || [])];
  console.log(`${id}\t#${di}\t${refs.map((r) => '#' + r).join(',') || '(none)'}`);
}
console.log('\nDANGLING REFS (referenced but never defined):');
for (const [id, refs] of referenced) {
  if (!defined.has(id)) console.log(`  $L${id} from ${[...refs].map((r) => '#' + r).join(',')}`);
}
