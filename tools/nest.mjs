import { readFileSync } from 'node:fs';

const file = process.argv[2];
const cls = process.argv[3];
const s = readFileSync(file, 'utf8');

const marker = `class="${cls}"`;
const i = s.indexOf(marker);
if (i < 0) {
  console.log('not found');
  process.exit(0);
}
// in DOM: find enclosing open tag start
let start = i;
while (start > 0 && s[start] !== '<') start--;
// walk back to find the enclosing open tag
const tagRe = /<([a-zA-Z][a-zA-Z0-9-]*)/g;
let m;
let best = null;
while ((m = tagRe.exec(s)) !== null) {
  if (m.index > i) break;
  best = m;
}
console.log('enclosing-ish tag', best && best[1], 'at', best && best.index);
console.log(JSON.stringify(s.slice(best.index, best.index + 300)));
