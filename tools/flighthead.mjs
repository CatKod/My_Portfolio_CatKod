import { readFileSync } from 'node:fs';

const html = readFileSync(process.argv[2], 'utf8');
const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
let out = '';
let n = 0;
for (const m of html.matchAll(re)) {
  out += JSON.parse('"' + m[1] + '"');
  n++;
}
console.log('pushes:', n, 'len:', out.length);
console.log('HEAD:', JSON.stringify(out.slice(0, 200)));
console.log('TAIL:', JSON.stringify(out.slice(-200)));
