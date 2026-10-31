import { readFileSync } from 'node:fs';

const f = process.argv[2];
const h = readFileSync(f, 'utf8');
const txt = h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, '|').replace(/\|+/g, '|');
console.log(txt.slice(0, 2500));
console.log('---LINKS---');
const links = [...h.matchAll(/href="([^"]+)"/g)].map(m => m[1])
  .filter(u => !u.startsWith('/_next') && !u.startsWith('#'));
console.log([...new Set(links)].join('\n'));
console.log('---MAILTO/TEL---');
console.log([...new Set([...h.matchAll(/(mailto:|tel:)[^"'\s)]+/g)].map(m => m[0]))].join('\n'));
console.log('---IMG---');
console.log([...new Set([...h.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1]))].join('\n'));
