import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const html = readFileSync(process.argv[2], 'utf8');
splitFlight(html).forEach((p, i) => {
  const len = p.text.length;
  if (p.kind === 'flight') {
    const d = decodeFlight(p.text);
    console.log(`#${i} FLIGHT len=${len} head=${JSON.stringify(d.slice(0, 60))}`);
  } else {
    console.log(`#${i} RAW   len=${len} head=${JSON.stringify(p.text.slice(0, 80))} tail=${JSON.stringify(p.text.slice(-60))}`);
  }
});
