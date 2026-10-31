import { readFileSync } from 'node:fs';
const h = readFileSync(process.argv[2], 'utf8');
// tìm khối legend (bảng màu)
const i = h.indexOf('contribution-graph-legend');
console.log('first legend at', i);
// tìm tất cả style background-color gần legend
const re = /background-color:\s*(#[0-9a-fA-F]{6})/g;
let m;
const seen = [];
while ((m = re.exec(h)) !== null) seen.push([m[1], m.index]);
console.log('bg colors', seen.length);
console.log(JSON.stringify(seen.slice(0, 20)));
// in vùng legend
const j = h.lastIndexOf('ContributionCalendar-day', h.length);
console.log('--- tail region ---');
console.log(h.slice(h.length - 3000));
