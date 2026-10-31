import { readFileSync } from 'node:fs';

const ROUTES = ['index.html', 'about', 'work', 'skills', 'credentials', 'guestbook', 'contact'];
const NEEDLES = ['Instagram', 'instagram', 'Discord', 'discord', 'JLPT', 'LinkedIn', 'linkedin'];
for (const f of ROUTES) {
  const html = readFileSync('site.orig.bak/' + f, 'utf8');
  const counts = {};
  for (const n of NEEDLES) {
    const c = html.split(n).length - 1;
    if (c) counts[n] = c;
  }
  console.log(f, JSON.stringify(counts));
}
