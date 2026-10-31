import fs from 'fs';
const path = 'site/_next/static/chunks';
const needles = ['skill-proof-grid', 'skill-tool-group', 'skill-hero-card'];
for (const f of fs.readdirSync(path)) {
  if (!f.endsWith('.js')) continue;
  const s = fs.readFileSync(path + '/' + f, 'utf8');
  for (const n of needles) {
    let i = s.indexOf('"' + n + '"');
    if (i !== -1) console.log(f, n, i);
  }
}
