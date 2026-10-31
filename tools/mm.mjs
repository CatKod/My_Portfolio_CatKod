import { readFileSync } from 'node:fs';

const h = readFileSync(process.argv[2], 'utf8');
const i = h.indexOf('MobileStaggeredMenu');
const seg = h.slice(i, i + 6000);
console.log(seg);
