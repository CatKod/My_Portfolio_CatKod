import { readFileSync } from 'node:fs';

const s = readFileSync(process.argv[2], 'utf8');
const needle = process.argv[3];
const before = Number(process.argv[4] || 300);
const after = Number(process.argv[5] || 3000);
let i = 0;
while ((i = s.indexOf(needle, i + 1)) > 0) {
  console.log('--- @' + i);
  console.log(s.slice(Math.max(0, i - before), i + after));
}
