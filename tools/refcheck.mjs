import fs from 'fs';
import path from 'path';

const renamed = fs.readdirSync('site/_next/static/chunks').filter((f) => f.endsWith('.catkod.js'));

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else files.push(p);
  }
})('site');

for (const nf of renamed) {
  const old = nf.replace('.catkod.js', '.js');
  const hits = [];
  for (const f of files) {
    if (f.endsWith('/' + old)) continue;
    let s;
    try { s = fs.readFileSync(f, 'utf8'); } catch { continue; }
    const n = s.split('/_next/static/chunks/' + old).length - 1;
    if (n > 0) hits.push(f + ' x' + n);
  }
  console.log(old, '->', nf, hits.length ? hits.join(', ') : 'OK');
}
