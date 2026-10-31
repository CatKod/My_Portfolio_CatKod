import { readFileSync } from 'node:fs';

const ROUTES = ['index.html', 'about', 'work', 'skills', 'credentials', 'guestbook', 'contact'];
for (const r of ROUTES) {
  const s = readFileSync('site/' + r, 'utf8');
  let n = 0;
  let i = 0;
  while ((i = s.indexOf('brand-mark', i + 1)) > 0) n++;
  console.log(r, 'brand-mark occurrences:', n);
  const j = s.indexOf('brand-mark');
  if (j > 0) console.log('   ', JSON.stringify(s.slice(j - 120, j + 120)));
}
