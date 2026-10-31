import { readFileSync } from 'node:fs';

const file = process.argv[2];
const needle = process.argv[3];
const before = Number(process.argv[4] || 200);
const after = Number(process.argv[5] || 600);
const s = readFileSync(file, 'utf8');
let i = 0;
while ((i = s.indexOf(needle, i + 1)) > 0) {
  console.log('--- @' + i);
  console.log(s.slice(Math.max(0, i - before), i + after));
}
