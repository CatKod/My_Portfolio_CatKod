import { readFileSync } from 'node:fs';

const ROUTES = ['index.html', 'about', 'work', 'skills', 'credentials', 'guestbook', 'contact'];

function classes(s) {
  const out = new Set();
  for (const m of s.matchAll(/class="([^"]+)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c) out.add(c);
  }
  return out;
}

const mode = process.argv[2] || 'classes';

for (const r of ROUTES) {
  const a = readFileSync('site.orig.bak/' + r, 'utf8');
  const b = readFileSync('site/' + r, 'utf8');
  if (mode === 'classes') {
    const ca = classes(a);
    const cb = classes(b);
    const onlyA = [...ca].filter((c) => !cb.has(c));
    const onlyB = [...cb].filter((c) => !ca.has(c));
    console.log(
      r,
      '| orig',
      ca.size,
      '| new',
      cb.size,
      '\n  removed:',
      onlyA.join(' ') || '(none)',
      '\n  added:  ',
      onlyB.join(' ') || '(none)',
    );
  }
}
