import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const NEEDLES = ['Irfan', 'irfan', 'Indonesia', 'Pontianak', 'Kalimantan'];
const dir = 'site/_next/static/chunks';
for (const f of readdirSync(dir)) {
  const p = join(dir, f);
  let t;
  try { t = readFileSync(p, 'utf8'); } catch { continue; }
  for (const n of NEEDLES) {
    let i = t.indexOf(n);
    while (i >= 0) {
      console.log(`### ${f} [${n}] @${i}`);
      console.log(JSON.stringify(t.slice(Math.max(0, i - 200), i + 220)));
      i = t.indexOf(n, i + 1);
    }
  }
}
