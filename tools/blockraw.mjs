import { readFileSync } from 'node:fs';

const file = process.argv[2];
const s = readFileSync(file, 'utf8');
const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
let i = 0;
for (const m of s.matchAll(re)) {
  i++;
  if (process.argv[3] && String(i) !== process.argv[3]) continue;
  console.log('--- block', i, 'raw script tag:');
  console.log(m[0].slice(0, 400));
  console.log('--- decoded:');
  console.log(JSON.parse(m[1]).slice(0, 400));
}
