import { readFileSync } from 'node:fs';
const files = ['site.orig.bak/index.html', 'site.orig.bak/credentials', 'site.orig.bak/guestbook'];
for (const f of files) {
  const h = readFileSync(f, 'utf8');
  const m = [...h.matchAll(/["'(]([^"')]*\.pdf[^"')]*)/g)].map((x) => x[1]);
  console.log(f, [...new Set(m)]);
}
const h2 = readFileSync('site.orig.bak/credentials', 'utf8');
const imgs = [...h2.matchAll(/src="([^"]*_next\/image[^"]*)"/g)].map((x) => x[1]);
console.log('imgs:', [...new Set(imgs)]);
