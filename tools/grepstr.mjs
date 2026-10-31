import { readFileSync, readdirSync } from 'node:fs';

const dir = process.argv[2];
const needle = (process.argv[3] || 'irfan').toLowerCase();
for (const f of readdirSync(dir)) {
  const h = readFileSync(dir + '/' + f, 'utf8');
  const hits = [...h.matchAll(new RegExp('[^"\'`\\n]{0,70}' + needle + '[^"\'`\\n]{0,70}', 'gi'))].map(m => m[0]);
  if (hits.length) {
    console.log('=== ' + f + ' (' + hits.length + ' hits)');
    console.log([...new Set(hits)].join('\n'));
  }
}
