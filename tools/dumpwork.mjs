import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const html = readFileSync('site/work', 'utf8');
for (const p of splitFile(html)) {
  if (p.kind !== 'flight') continue;
  for (const l of splitLines(p.text)) {
    if (l.id !== '19') continue;
    for (const n of ['embedded-iot-toolkit', 'projects', 'kpn-profile-company']) {
      const i = l.body.indexOf(n);
      console.log(n, '->', i);
      if (i >= 0) console.log('   ', JSON.stringify(l.body.slice(Math.max(0, i - 60), i + 100)));
    }
  }
}
