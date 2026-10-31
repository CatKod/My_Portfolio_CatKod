import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dir = 'site/_next/static/chunks';
const needle = process.argv[2];
const before = Number(process.argv[3] || 300);
const after = Number(process.argv[4] || 3000);
const only = process.argv[5];
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  if (only && f !== only) continue;
  const s = readFileSync(path.join(dir, f), 'utf8');
  let i = s.indexOf(needle);
  if (i === -1) continue;
  console.log(`\n===== ${f} @${i} =====`);
  console.log(s.slice(Math.max(0, i - before), Math.min(s.length, i + after)));
}
