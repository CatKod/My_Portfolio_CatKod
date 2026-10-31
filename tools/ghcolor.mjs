import { readFileSync } from 'node:fs';
const h = readFileSync(process.argv[2], 'utf8');
const re = /data-date="([\d-]+)"[^>]*data-level="(\d)"[^>]*style="background-color: ?(#[0-9a-fA-F]{6})/g;
let m;
const map = {};
const days = [];
while ((m = re.exec(h)) !== null) {
  days.push({ date: m[1], level: Number(m[2]), color: m[3] });
  (map[m[2]] ||= new Set()).add(m[3]);
}
console.log('parsed', days.length);
for (const [l, s] of Object.entries(map)) console.log('level', l, [...s].join(','));
console.log(JSON.stringify(days.slice(0, 5)));
