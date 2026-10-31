import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';

const html = readFileSync('site.orig.bak/credentials', 'utf8');
for (const cls of ['credential-letter-panel', 'credential-letter-list', 'credential-letter-card']) {
  const els = elementsByClass(html, cls);
  console.log('===', cls, els.length);
  if (els.length) console.log(els[0].slice(0, 1600));
}
const i = html.indexOf('credential-letter-panel');
console.log('### context');
console.log(html.slice(i - 600, i + 300));
