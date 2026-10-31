import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const html = readFileSync(process.argv[2], 'utf8');
splitFlight(html).forEach((p, i) => {
  if (p.kind !== 'flight') return;
  const d = decodeFlight(p.text);
  const m = /^(\w+):/.exec(d);
  if (!m) return;
  const body = d.slice(m[1].length + 1);
  try {
    const re = JSON.stringify(JSON.parse(body));
    if (re !== body) {
      console.log(`#${i} id=${m[1]} body=${JSON.stringify(body.slice(0, 120))}`);
      console.log(`   re =${JSON.stringify(re.slice(0, 120))}`);
    }
  } catch {
    /* ignore */
  }
});
