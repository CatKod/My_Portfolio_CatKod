import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

let totalBad = 0;
for (const file of process.argv.slice(2)) {
  const html = readFileSync(file, 'utf8');
  splitFlight(html).forEach((p, i) => {
    if (p.kind !== 'flight') return;
    const d = decodeFlight(p.text);
    const lines = d.split('\n');
    lines.forEach((ln, k) => {
      if (!ln) return;
      const ci = ln.indexOf(':');
      if (ci < 0) return;
      const body = ln.slice(ci + 1);
      try {
        const re = JSON.stringify(JSON.parse(body));
        if (re !== body) {
          console.log(`${file} #${i} line${k} id=${ln.slice(0, ci)} DIFF`);
          totalBad++;
        }
      } catch {
        /* module ref or non-JSON - expected */
      }
    });
  });
}
console.log('bad lines:', totalBad);
