import { readdirSync, readFileSync } from 'node:fs';
const dir = 'site/_next/static/chunks';
const needle = process.argv[2] || 'Github';
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const s = readFileSync(dir + '/' + f, 'utf8');
  const i = s.indexOf(needle);
  if (i >= 0) {
    console.log('==', f);
    console.log(s.slice(Math.max(0, i - 200), i + 600));
  }
}
