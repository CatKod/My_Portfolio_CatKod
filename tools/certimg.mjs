import { readFileSync } from 'node:fs';
const h = readFileSync('site.orig.bak/credentials', 'utf8');
const imgs = [...h.matchAll(/<img[^>]*>/g)].map((x) => x[0]);
console.log(imgs.slice(0, 6).join('\n'));
console.log('count', imgs.length);
const i = h.indexOf('credential-certificate-list');
console.log(JSON.stringify(h.slice(i, i + 2200)));
