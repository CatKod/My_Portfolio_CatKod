import { readFileSync } from 'node:fs';

const file = process.argv[2];
const cls = process.argv[3];
const s = readFileSync(file, 'utf8');
const i = s.indexOf(cls);
if (i < 0) {
  console.log('not found');
  process.exit(0);
}
console.log(s.slice(i - 100, i + 3000));
