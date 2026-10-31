import { readFileSync, writeFileSync } from 'node:fs';

const h = readFileSync(process.argv[2], 'utf8');
const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
let m;
let raw = '';
let all = '';
while ((m = re.exec(h)) !== null) {
  raw += m[0];
  all += JSON.parse('"' + m[1] + '"');
}
writeFileSync(process.argv[3] + '.flight.raw', raw);
writeFileSync(process.argv[3] + '.flight.txt', all);
console.log('raw', raw.length, 'decoded', all.length);
