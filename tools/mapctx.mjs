import { readFileSync } from 'node:fs';
const s = readFileSync('site/_next/static/chunks/15nsyxl.8hl16.js', 'utf8');
const i = s.indexOf('"Draw.io"');
const start = s.lastIndexOf('{', i);
console.log(s.slice(start - 300, start + 200));
console.log('-----');
const j = s.indexOf('"Microsoft Excel"');
console.log(j);
