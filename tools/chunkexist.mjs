import fs from 'fs';
const routes = ['site/index.html', 'site/about', 'site/work', 'site/skills', 'site/credentials', 'site/guestbook', 'site/contact'];
for (const r of routes) {
  const h = fs.readFileSync(r, 'utf8');
  const re = /_next\\?\/static\\?\/chunks\\?\/([^"'\\)\s]+)/g;
  const set = new Set();
  let m;
  while ((m = re.exec(h))) set.add(m[1]);
  const missing = [...set].filter((s) => !fs.existsSync('site/_next/static/chunks/' + s));
  console.log(r.padEnd(22), missing.length ? 'THIẾU: ' + missing.join(', ') : 'tất cả chunk tồn tại');
}
