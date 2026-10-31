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

const needle = process.argv[3];
let i = -1;
let n = 0;
while ((i = dom.indexOf(needle, i + 1)) > 0) {
  n++;
  console.log('--- DOM occurrence', n, 'at', i);
  console.log(dom.slice(Math.max(0, i - 400), i + 400).replace(/\s+/g, ' '));
}
console.log('total DOM occurrences', n);

let j = -1;
let m = 0;
while ((j = flight.indexOf(needle, j + 1)) > 0) {
  m++;
  console.log('=== FLIGHT occurrence', m, 'at', j);
  console.log(flight.slice(Math.max(0, j - 400), j + 400).replace(/\s+/g, ' '));
}
console.log('total FLIGHT occurrences', m);
