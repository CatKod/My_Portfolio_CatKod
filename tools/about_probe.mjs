import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';

const html = readFileSync('site.orig.bak/about', 'utf8');
for (const cls of [
  'statement-panel',
  'profile-brief',
  'history-panel',
  'history-column-head',
  'profile-board',
  'skill-proof-grid',
  'skill-hero',
]) {
  const els = elementsByClass(html, cls);
  console.log('===', cls, els.length);
  if (els.length) console.log(els[0].slice(0, 1200));
}
