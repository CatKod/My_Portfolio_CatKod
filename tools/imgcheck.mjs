import { readFileSync, existsSync } from 'node:fs';

const s = readFileSync('site/credentials', 'utf8');
const m = s.match(/\/images\/credentials\/[^"\\ ]+/g) || [];
const uniq = [...new Set(m)];
for (const u of uniq) {
  const p = 'site' + u;
  console.log(existsSync(p) ? 'OK  ' : 'MISS', u);
}
