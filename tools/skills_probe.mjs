import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';

const html = readFileSync('site.orig.bak/skills', 'utf8');
for (const cls of ['skill-proof-grid', 'skills-hero', 'skill-index', 'skill-tool-grid', 'page-hero']) {
  const els = elementsByClass(html, cls);
  console.log('===', cls, els.length);
  if (els.length) console.log(els[0].slice(0, 1500));
}
console.log('### body head');
const i = html.indexOf('<main');
console.log(html.slice(i, i + 2500));
