import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const NEEDLES = [
  'Irfan', 'irfan', 'irfansabrian', 'Pontianak', 'Kalimantan', '6289508669156',
  'Indonesia', 'indonesia', 'SK selesai', 'Karya Profesional', 'Diskominfo',
  'Politeknik', 'Drafter Pemetaan', 'KPN', 'BNSP', 'Junior Web Developer',
  'Junior Web Programmer', 'D3 Teknik Informatika', 'KuyoSoft', 'Kuyossoft',
];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk('site').filter((f) => /\.(html|js|css|json|txt|svg|xml)$/.test(f) || !/\./.test(f));
for (const f of files) {
  let t;
  try {
    t = readFileSync(f, 'utf8');
  } catch {
    continue;
  }
  const hits = NEEDLES.filter((n) => t.includes(n));
  if (hits.length) console.log(f, '->', hits.join(', '));
}
