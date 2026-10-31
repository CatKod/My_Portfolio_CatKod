import { readFileSync } from 'node:fs';

const ROUTES = ['index.html', 'about', 'work', 'skills', 'credentials', 'guestbook', 'contact'];
for (const r of ROUTES) {
  const s = readFileSync('site/' + r, 'utf8');
  const m = [...new Set(s.match(/\/pdf\/[^"'\\ ]+/g) || [])];
  console.log(r, JSON.stringify(m));
}
