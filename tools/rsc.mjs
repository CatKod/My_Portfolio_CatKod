import { readFileSync } from 'node:fs';

const h = readFileSync(process.argv[2], 'utf8');
// collect all self.__next_f.push payloads and decode the escaped JSON string
const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
let m;
let all = '';
while ((m = re.exec(h)) !== null) {
  all += JSON.parse('"' + m[1] + '"');
}
const needle = process.argv[3];
if (needle) {
  let i = all.indexOf(needle);
  while (i >= 0) {
    console.log('--- @' + i);
    console.log(all.slice(Math.max(0, i - 800), i + 800));
    i = all.indexOf(needle, i + 1);
  }
} else {
  console.log('total decoded length', all.length);
}
