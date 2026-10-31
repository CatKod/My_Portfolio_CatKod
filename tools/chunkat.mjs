import { readdirSync, readFileSync } from 'node:fs';
const dir = 'site/_next/static/chunks';
const needle = process.argv[2] || 'logo-loop-set';
const ctx = Number(process.argv[3] || 3000);
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const s = readFileSync(dir + '/' + f, 'utf8');
  const i = s.indexOf(needle);
  if (i >= 0) {
    console.log('==', f);
    console.log(s.slice(Math.max(0, i - 600), i + ctx));
    break;
  }
}
