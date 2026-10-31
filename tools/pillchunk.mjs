import fs from 'fs';
const path = 'site/_next/static/chunks';
for (const f of fs.readdirSync(path)) {
  if (!f.endsWith('.js')) continue;
  const s = fs.readFileSync(path + '/' + f, 'utf8');
  for (const n of ['tool-pill', 'skill-tool', 'index-card', 'proof-grid']) {
    let i = s.indexOf(n);
    if (i !== -1) {
      console.log('===', f, n, i);
      console.log(JSON.stringify(s.slice(Math.max(0, i - 900), i + 600)));
    }
  }
}
