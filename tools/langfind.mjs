import { readdirSync, readFileSync } from 'node:fs';
const dir = 'site/_next/static/chunks';
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const s = readFileSync(dir + '/' + f, 'utf8');
  if (!s.includes('Malay')) continue;
  const i = s.indexOf('Malay');
  console.log('==', f);
  console.log(s.slice(Math.max(0, i - 700), i + 400));
}
