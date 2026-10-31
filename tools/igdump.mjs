import { readFileSync } from 'node:fs';
import { splitFile } from './flight.mjs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
const parts = splitFile(html);
for (const p of parts) {
  if (p.kind === 'raw') {
    let i = -1;
    while ((i = p.text.indexOf('Instagram', i + 1)) > 0) {
      console.log('[DOM] @' + i, JSON.stringify(p.text.slice(Math.max(0, i - 700), i + 200)));
      console.log('---');
    }
  } else {
    let i = -1;
    while ((i = p.text.indexOf('Instagram', i + 1)) > 0) {
      console.log('[FLIGHT] @' + i, JSON.stringify(p.text.slice(Math.max(0, i - 700), i + 200)));
      console.log('---');
    }
  }
}
