import { readFileSync } from 'node:fs';

const file = process.argv[2];
const needle = process.argv[3];
const s = readFileSync(file, 'utf8');
let i = 0;
let n = 0;
while ((i = s.indexOf(needle, i + 1)) > 0) {
  n++;
  console.log('--- @' + i);
  console.log(s.slice(Math.max(0, i - 200), i + 400));
}
console.log('count', n);
