import { readFileSync } from 'node:fs';
const s = readFileSync(process.argv[2], 'utf8');
const needle = process.argv[3] || 'login';
let i = -1;
while ((i = s.indexOf(needle, i + 1)) >= 0) {
  console.log('---', i, JSON.stringify(s.slice(Math.max(0, i - 80), i + 120)));
}
