import { readFileSync } from 'node:fs';

const html = readFileSync('site.orig.bak/index.html', 'utf8');
const i = html.indexOf('class="social-nav"');
const j = html.indexOf('</nav>', i);
console.log(html.slice(i, i + 3000));
