import { readFileSync, writeFileSync } from 'node:fs';

const h = readFileSync(process.argv[2], 'utf8');
const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
let m, all = '';
while ((m = re.exec(h)) !== null) all += JSON.parse('"' + m[1] + '"');
writeFileSync(process.argv[3], all);
console.log('decoded', all.length);
