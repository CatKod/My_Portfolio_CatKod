import { readFileSync } from 'node:fs';

const ROUTES = ['index.html', 'about', 'work', 'skills', 'credentials', 'guestbook', 'contact'];

for (const r of ROUTES) {
  const s = readFileSync('site/' + r, 'utf8');
  const m = s.match(/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g) || [];
  let decoded = '';
  for (const chunk of m) {
    const body = chunk.slice(chunk.indexOf(',"') + 2, chunk.lastIndexOf('"'));
    try {
      decoded += JSON.parse('"' + body + '"');
    } catch {
      /* ignore */
    }
  }
  const defs = new Set();
  for (const mm of decoded.matchAll(/^(\d+):/gm)) defs.add(mm[1]);
  const refs = new Set();
  for (const mm of decoded.matchAll(/\$L(\d+)/g)) refs.add(mm[1]);
  const dangling = [...refs].filter((x) => !defs.has(x));
  console.log(r, 'defs', defs.size, 'refs', refs.size, 'dangling:', dangling.join(','));
}
