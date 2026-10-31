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
    if (re === body) return;
    let k = 0;
    while (k < Math.min(body.length, re.length) && body[k] === re[k]) k++;
    console.log(`#${i} id=${m[1]} firstDiff@${k} bodyTail=${JSON.stringify(body.slice(k))} reTail=${JSON.stringify(re.slice(k))}`);
  } catch {
    /* ignore */
  }
});
