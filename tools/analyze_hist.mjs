import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';

const html = readFileSync('site.orig.bak/about', 'utf8');
elementsByClass(html, 'history-list').forEach((p, i) => {
  console.log('=== list', i);
  const arts = [...p.matchAll(/<article data-history-item="true">([\s\S]*?)<\/article>/g)].map((x) => x[1]);
  arts.forEach((a, j) => {
    const span = /<span>([^<]*)<\/span>/.exec(a);
    const h2 = /<h2>([^<]*)<\/h2>/.exec(a);
    const st = /<strong>([^<]*)<\/strong>/.exec(a);
    const pp = /<p>([^<]*)<\/p>/.exec(a);
    console.log(j, JSON.stringify([span && span[1], h2 && h2[1], st && st[1], pp && pp[1]]));
  });
});
