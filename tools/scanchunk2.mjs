import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const NEEDLES = [
  'Irfan', 'irfan', 'Pontianak', 'Kalimantan', 'Indonesia',
  'Karya Profesional', 'Diskominfo', 'Politeknik', 'SK-0', 'Drafter',
  'Surveyor', 'BNSP', 'Smart Computer', 'Junior Web',
];
const dir = 'site/_next/static/chunks';
for (const f of readdirSync(dir)) {
  const t = readFileSync(join(dir, f), 'utf8');
  const counts = {};
  for (const n of NEEDLES) {
    const c = t.split(n).length - 1;
    if (c) counts[n] = c;
  }
  if (Object.keys(counts).length) console.log(f, JSON.stringify(counts));
}
