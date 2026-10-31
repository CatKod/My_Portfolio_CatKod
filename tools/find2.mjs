import { readFileSync } from 'node:fs';

const h = readFileSync(process.argv[2], 'utf8');
const needle = process.argv[3];
const before = +(process.argv[4] || 0);
const after = +(process.argv[5] || 0);
let i = -1;
let c = 0;
while ((i = h.indexOf(needle, i + 1)) !== -1) {
  c++;
  console.log('=== occurrence ' + c + ' at ' + i + ' ===');
  console.log(JSON.stringify(h.slice(Math.max(0, i - before), i + after)));
  if (c > 8) break;
}
console.log('total occurrences', c);
