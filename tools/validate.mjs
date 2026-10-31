import { readFileSync } from 'node:fs';

const ROUTES = ['index.html', 'about', 'work', 'skills', 'credentials', 'guestbook', 'contact'];

for (const r of ROUTES) {
  const s = readFileSync('site/' + r, 'utf8');
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let flight = '';
  let bad = 0;
  let total = 0;
  for (const m of s.matchAll(re)) {
    total++;
    try {
      flight += JSON.parse(m[1]);
    } catch (e) {
      bad++;
      console.log(r, 'BAD JSON in script chunk at', m.index, e.message);
    }
  }
  const rows = new Map();
  for (const line of flight.split('\n')) {
    const m = line.match(/^([0-9a-f]+):(.*)$/);
    if (!m) continue;
    let parsed = null;
    try {
      parsed = JSON.parse(m[2]);
    } catch (e) {
      console.log(r, 'BAD ROW', m[1], e.message, m[2].slice(0, 120));
      continue;
    }
    rows.set(m[1], parsed);
  }
  const refs = new Set();
  for (const m of flight.matchAll(/\$L([0-9a-f]+)/g)) refs.add(m[1]);
  const dangling = [...refs].filter((x) => !rows.has(x));
  console.log(
    r.padEnd(12),
    'scripts', total,
    'badJson', bad,
    'rows', rows.size,
    'refs', refs.size,
    dangling.length ? 'DANGLING: ' + dangling.join(',') : 'ok',
  );
}
