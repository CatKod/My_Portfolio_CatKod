import { readFileSync } from 'node:fs';

const html = readFileSync('site.orig.bak/index.html', 'utf8');
const i = html.indexOf('class="frame-footer"');
console.log(html.slice(i - 100, i + 2500));
