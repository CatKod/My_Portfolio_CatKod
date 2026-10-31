import { readFileSync } from 'node:fs';

const html = readFileSync('site.orig.bak/index.html', 'utf8');
const i = html.indexOf('<main');
const j = html.indexOf('<footer', i);
console.log(
  html
    .slice(i, j)
    .replace(/<svg[\s\S]*?<\/svg>/g, '<SVG/>')
    .replace(/<img[^>]*>/g, '<IMG/>')
    .slice(0, 7000),
);
