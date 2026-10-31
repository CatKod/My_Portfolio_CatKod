import fs from 'fs';
import path from 'path';

const dir = 'site/_next/static/chunks';
const needles = process.argv.slice(2);

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.css')) continue;
  const s = fs.readFileSync(path.join(dir, f), 'utf8');
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(s))) {
    const sel = m[1].trim();
    if (!needles.some((n) => sel.includes(n))) continue;
    console.log('[' + f + '] ' + sel + ' { ' + m[2] + ' }');
    console.log();
  }
}
