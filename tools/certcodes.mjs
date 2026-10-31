import { readFileSync } from 'node:fs';

const file = process.argv[2];
const s = readFileSync(file, 'utf8');
const flightRe = /self\.__next_f\.push\(\[1,"(?:[^"\\]|\\.)*"\]\)/g;
let flight = '';
let dom = '';
let last = 0;
for (const m of s.matchAll(flightRe)) {
  dom += s.slice(last, m.index);
  last = m.index + m[0].length;
  const b = m[0].slice(m[0].indexOf(',"') + 2, m[0].lastIndexOf('"'));
  try {
    flight += JSON.parse('"' + b + '"');
  } catch {
    /* ignore */
  }
}
dom += s.slice(last);

function codes(text) {
  const out = [];
  for (const m of text.matchAll(/>([A-Z]{2,4}-[0-9A-Z]{2,4})</g)) out.push(m[1]);
  return out;
}
console.log('DOM codes :', codes(dom).join(' '));
console.log('FLIGHT codes:', codes(flight).join(' '));
