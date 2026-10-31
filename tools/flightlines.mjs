import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const html = readFileSync(process.argv[2], 'utf8');
splitFlight(html).forEach((p, i) => {
  if (p.kind !== 'flight') return;
  const d = decodeFlight(p.text);
  const lines = d.split('\n');
  console.log(`#${i} lines=${lines.length}`);
  lines.forEach((ln, k) => {
    const m = /^([^:]+):(.*)$/s.exec(ln);
    if (!m) {
      console.log(`   [${k}] UNPARSED len=${ln.length} ${JSON.stringify(ln.slice(0, 60))}`);
      return;
    }
    const body = m[2];
    let kind = 'json';
    try {
      JSON.parse(body);
    } catch {
      kind = 'NON-JSON';
    }
    console.log(`   [${k}] id=${m[1]} ${kind} len=${body.length}`);
  });
});
