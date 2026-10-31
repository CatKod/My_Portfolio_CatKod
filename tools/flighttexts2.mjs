import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const ROUTES = {
  '/': 'site.orig.bak/index.html',
  '/about': 'site.orig.bak/about',
  '/work': 'site.orig.bak/work',
  '/skills': 'site.orig.bak/skills',
  '/credentials': 'site.orig.bak/credentials',
  '/guestbook': 'site.orig.bak/guestbook',
  '/contact': 'site.orig.bak/contact',
};

for (const [route, file] of Object.entries(ROUTES)) {
  console.log('\n##########', route);
  const html = readFileSync(file, 'utf8');
  const seen = new Set();
  for (const p of splitFile(html)) {
    if (p.kind === 'raw') continue;
    for (const l of splitLines(p.text)) {
      // chỉ lấy giá trị "children":"..." hoặc "children":[...string]
      const re = /"children":"((?:[^"\\]|\\.)*)"/g;
      let m;
      while ((m = re.exec(l.body)) !== null) {
        if (m[1].length > 1 && !seen.has(m[1])) {
          seen.add(m[1]);
          console.log(`  [${l.id}] ${JSON.stringify(m[1])}`);
        }
      }
    }
  }
}
