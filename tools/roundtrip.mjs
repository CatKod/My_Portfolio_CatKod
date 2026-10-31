import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
let bad = 0;
splitFlight(html).forEach((p, i) => {
  if (p.kind !== 'flight') return;
  const d = decodeFlight(p.text);
  const m = /^(\w+):/.exec(d);
  if (!m) {
    console.log(`#${i} SKIP (no id prefix) len=${d.length}`);
    return;
  }
  const id = m[1];
  const body = d.slice(id.length + 1);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch (e) {
    console.log(`#${i} id=${id} PARSE FAIL: ${e.message}`);
    bad++;
    return;
  }
  const re = JSON.stringify(parsed);
  if (re !== body) {
    console.log(`#${i} id=${id} ROUNDTRIP DIFF len=${body.length} vs ${re.length}`);
    for (let k = 0; k < Math.min(body.length, re.length); k++) {
      if (body[k] !== re[k]) {
        console.log('  at', k, JSON.stringify(body.slice(k - 60, k + 60)), '||', JSON.stringify(re.slice(k - 60, k + 60)));
        break;
      }
    }
    bad++;
  } else {
    console.log(`#${i} id=${id} OK len=${body.length}`);
  }
});
console.log('bad:', bad);
