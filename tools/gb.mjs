import { readFileSync } from 'node:fs';

const html = readFileSync('site.orig.bak/guestbook', 'utf8');
const needles = ['Irfan', 'irfan', 'Indonesia', 'irfansabrian'];
for (const n of needles) {
  let i = html.indexOf(n);
  while (i >= 0) {
    console.log(`[${n}] @${i}:`, JSON.stringify(html.slice(Math.max(0, i - 250), i + 250)));
    i = html.indexOf(n, i + 1);
  }
}
