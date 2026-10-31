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
  for (const p of splitFile(html)) {
    if (p.kind === 'raw') continue;
    for (const l of splitLines(p.text)) {
      const classes = [...l.body.matchAll(/"className":"([a-z0-9-]+)"/g)].map((x) => x[1]);
      const uniq = [...new Set(classes)];
      console.log(`part${p.index} id=${l.id} len=${l.body.length} classes=${uniq.join(',')}`);
    }
  }
}
