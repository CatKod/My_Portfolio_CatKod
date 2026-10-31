import fs from 'fs';
import path from 'path';

const dir = 'site/_next/static/chunks';
const needle = process.argv[2];

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const s = fs.readFileSync(path.join(dir, f), 'utf8');
  let i = -1;
  while ((i = s.indexOf(needle, i + 1)) !== -1) {
    console.log('=== ' + f + ' @' + i);
    console.log(s.slice(Math.max(0, i - 700), i + 500));
    console.log();
    break;
  }
}
