import { readFileSync } from 'node:fs';
const h = readFileSync(process.argv[2], 'utf8');
const needle = process.argv[3];
let i = -1, c = 0;
while ((i = h.indexOf(needle, i + 1)) !== -1) {
  c++;
  console.log('=== ' + c + ' @' + i + ' ===');
  console.log(h.slice(Math.max(0, i - 300), i + 1200));
  console.log();
  if (c > 2) break;
}
