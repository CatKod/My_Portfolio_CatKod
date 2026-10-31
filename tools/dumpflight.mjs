import fs from 'fs';
const file = process.argv[2] || 'site/skills';
const s = fs.readFileSync(file, 'utf8');
const flightRe = /self\.__next_f\.push\(\[1,"(?:[^"\\]|\\.)*"\]\)/g;
let flight = '';
for (const m of s.matchAll(flightRe)) {
  const b = m[0].slice(m[0].indexOf(',"') + 2, m[0].lastIndexOf('"'));
  try { flight += JSON.parse('"' + b + '"'); } catch {}
}
fs.writeFileSync(process.argv[3] || 'tmp_flight.txt', flight);
const i = flight.indexOf('skill-index-card');
console.log('len', flight.length, 'idx', i);
if (i !== -1) console.log(JSON.stringify(flight.slice(i - 200, i + 3000)));
