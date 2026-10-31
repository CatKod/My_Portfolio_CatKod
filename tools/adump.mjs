import { readFileSync } from 'node:fs';
const s = readFileSync(process.argv[2], 'utf8');
const re = /<a href="[^"]*github[^"]*"[^>]*>[\s\S]{0,700}?<\/a>/g;
let n = 0;
for (const m of s.matchAll(re)) {
  console.log('--- ' + n++);
  console.log(m[0]);
  if (n >= 3) break;
}
