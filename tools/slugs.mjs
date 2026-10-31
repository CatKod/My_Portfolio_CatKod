import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const html = readFileSync('site/work', 'utf8');
const parts = splitFile(html);
for (const p of parts) {
  if (p.kind !== 'flight') continue;
  for (const l of splitLines(p.text)) {
    if (l.id !== '19') continue;
    // tìm tất cả slug
    const slugs = [...l.body.matchAll(/"slug":"([^"]+)"/g)].map((x) => x[1]);
    console.log('slugs', slugs.length);
    console.log(slugs.join('\n'));
  }
}
