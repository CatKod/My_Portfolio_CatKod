import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const NEEDLES = ['Irfan', 'irfan', 'Indonesia'];
const dir = 'site/_next/static/chunks';
for (const f of readdirSync(dir)) {
  const t = readFileSync(join(dir, f), 'utf8');
  for (const n of NEEDLES) {
    let i = t.indexOf(n);
    while (i >= 0) {
      console.log(`### ${f} [${n}] @${i}`);
      console.log('   ', JSON.stringify(t.slice(Math.max(0, i - 130), i + 130)));
      i = t.indexOf(n, i + 1);
    }
  }
}
