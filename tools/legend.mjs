import { readFileSync } from 'node:fs';
const h = readFileSync(process.argv[2], 'utf8');
// legend
const re = /contribution-graph-legend-level-(\d)[\s\S]{0,400}?background-color: ?(#[0-9a-fA-F]{6})/g;
let m;
const map = {};
while ((m = re.exec(h)) !== null) map[m[1]] = m[2];
console.log('legend map', map);
if (!Object.keys(map).length) {
  // thử cách khác: tìm block legend
  const i = h.indexOf('contribution-graph-legend-level-0');
  console.log(JSON.stringify(h.slice(i - 200, i + 1500)));
}
