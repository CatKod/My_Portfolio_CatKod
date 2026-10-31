import { readFileSync } from 'node:fs';

const ROUTES = ['index.html', 'about', 'work', 'skills', 'credentials', 'guestbook', 'contact'];

function flightOf(file) {
  const s = readFileSync(file, 'utf8');
  const m = s.match(/self\.__next_f\.push\(\[1,"(?:[^"\\]|\\.)*"\]\)/g) || [];
  let d = '';
  for (const c of m) {
    const b = c.slice(c.indexOf(',"') + 2, c.lastIndexOf('"'));
    try {
      d += JSON.parse('"' + b + '"');
    } catch {
      /* ignore */
    }
  }
  return d;
}

function analyze(file) {
  const d = flightOf(file);
  const defs = new Set();
  for (const mm of d.matchAll(/^(\d+):/gm)) defs.add(mm[1]);
  const rr = new Set();
  for (const mm of d.matchAll(/\$L(\d+)/g)) rr.add(mm[1]);
  const dangling = [...rr].filter((x) => !defs.has(x));
  const nodeLines = d.split('\n').filter((l) => /^\d+:/.test(l));
  return { defs: defs.size, dangling, nodeLines };
}

for (const r of ROUTES) {
  const a = analyze('site.orig.bak/' + r);
  const b = analyze('site/' + r);
  console.log(r);
  console.log('  ORIG defs', a.defs, 'dangling', a.dangling.join(','));
  console.log('  NEW  defs', b.defs, 'dangling', b.dangling.join(','));
}
