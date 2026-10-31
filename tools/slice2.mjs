import { readFileSync } from 'node:fs';
const f = process.argv[2];
const t = readFileSync(f, 'utf8');
const needle = process.argv[3];
const before = +(process.argv[4] || 0);
const after = +(process.argv[5] || 0);
let i = -1, c = 0;
while ((i = t.indexOf(needle, i + 1)) !== -1) {
  c++;
  console.log('=== ' + c + ' @' + i + ' ===');
  console.log(JSON.stringify(t.slice(Math.max(0, i - before), i + after)));
  if (c > 6) break;
}
console.log('total', c);
