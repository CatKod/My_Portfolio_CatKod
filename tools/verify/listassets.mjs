import { readFileSync } from 'node:fs';
const h = readFileSync(process.argv[2], 'utf8');
const set = new Set();
for (const m of h.matchAll(/[\"'(]([^\"'()\s]*\.(?:png|jpg|jpeg|webp|svg|avif|gif))[\"')]/gi)) set.add(m[1]);
console.log([...set].join('\n'));
console.log('--- url()');
for (const m of h.matchAll(/url\(([^)]+)\)/g)) console.log(m[1]);
