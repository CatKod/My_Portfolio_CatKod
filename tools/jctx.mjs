import { readFileSync } from 'node:fs';

const s = readFileSync(process.argv[2], 'utf8');
const needle = process.argv[3];
let i = 0;
while ((i = s.indexOf(needle, i + 1)) > 0) {
  console.log('--- @' + i);
  console.log(JSON.stringify(s.slice(Math.max(0, i - 400), i + 900)));
}
