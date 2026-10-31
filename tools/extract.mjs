import { readFileSync, writeFileSync } from 'node:fs';

const route = process.argv[2];
const outFile = process.argv[3];

const htmlFile = 'site/' + route;
const h = readFileSync(htmlFile, 'utf8');
const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
let m;
let parts = [];
while ((m = re.exec(h)) !== null) {
  parts.push(m[0]);
}
const body = parts.join('');
const re2 = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
let all = '';
let mm;
while ((mm = re2.exec(h)) !== null) all += JSON.parse('"' + mm[1] + '"');
writeFileSync(outFile, all);
console.log('route', route, 'parts', parts.length, 'decodedLen', all.length);
