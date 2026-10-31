import { readFileSync } from 'node:fs';

const html = readFileSync('site.orig.bak/index.html', 'utf8');
const i = html.indexOf('class="brand-mark"');
const s = html.indexOf('<svg', i);
const e = html.indexOf('</svg>', s) + 6;
console.log('=== DOM brand svg');
console.log(html.slice(s, e));
// mobile head
const j = html.indexOf('class="mobile-staggered-head"');
const s2 = html.indexOf('<svg', j);
const e2 = html.indexOf('</svg>', s2) + 6;
console.log('=== DOM mobile svg');
console.log(html.slice(s2, e2));
