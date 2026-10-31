import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dir = 'site/_next/static/chunks';
const needles = process.argv.slice(2);
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const s = readFileSync(path.join(dir, f), 'utf8');
  for (const n of needles) {
    let i = 0;
    while ((i = s.indexOf(n, i)) !== -1) {
      const start = Math.max(0, i - 90);
      console.log(`${f} @${i} [${n}]  ...${s.slice(start, i + n.length + 90)}...`);
      i += n.length;
    }
  }
}
