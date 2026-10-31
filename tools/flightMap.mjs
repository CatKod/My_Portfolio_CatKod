import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
splitFlight(html).forEach((p, i) => {
  if (p.kind !== 'flight') return;
  const d = decodeFlight(p.text);
  const ids = [...d.matchAll(/^(\w+):/gm)].map((m) => m[1]);
  const refs = [...new Set([...d.matchAll(/\$L(\w+)/g)].map((m) => m[1]))];
  console.log(`#${i} len=${d.length} ids=[${ids.join(',')}] refs=[${refs.join(',')}]`);
});
