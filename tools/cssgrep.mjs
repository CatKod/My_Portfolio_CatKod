import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dir = 'site/_next/static/chunks';
const needle = process.argv[2];
const ctx = Number(process.argv[3] || 300);
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.css')) continue;
  const s = readFileSync(path.join(dir, f), 'utf8');
  let i = s.indexOf(needle);
  if (i === -1) continue;
  console.log(`\n===== ${f} @${i} =====`);
  console.log(s.slice(Math.max(0, i - ctx), Math.min(s.length, i + ctx)));
}
