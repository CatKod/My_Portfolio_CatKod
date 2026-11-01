import { readFileSync } from 'node:fs';

const f = readFileSync('site/index.html', 'utf8');
console.log('CSS refs:', f.match(/href="[^"]*\.css[^"]*"/g));
console.log('irfan refs:', (f.match(/irfan[^"']*/g) || []).slice(0, 5));
console.log('catkod refs:', (f.match(/catkod[^"']*\.(css|js)/g) || []).slice(0, 5));
