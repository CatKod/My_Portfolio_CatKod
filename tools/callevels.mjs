import { readFileSync } from 'node:fs';
const h = readFileSync(process.argv[2], 'utf8');
const re = /<rect fill="(#[0-9a-fA-F]{6})" height="10"[^>]*><title>([^<]*?)<\/title>/g;
let m;
const rows = [];
while ((m = re.exec(h)) !== null) {
  const tip = m[2];
  const cm = /(\d+) GitHub contribution/.exec(tip);
  rows.push({ color: m[1], count: cm ? Number(cm[1]) : 0 });
}
const byColor = {};
for (const r of rows) (byColor[r.color] ||= []).push(r.count);
for (const [k, v] of Object.entries(byColor)) {
  v.sort((a, b) => a - b);
  console.log(k, 'n=' + v.length, 'min', v[0], 'max', v[v.length - 1]);
}
// tìm ngưỡng: sort distinct counts with color
const seen = new Map();
for (const r of rows) if (!seen.has(r.count)) seen.set(r.count, r.color);
console.log([...seen.entries()].sort((a, b) => a[0] - b[0]).map(([c, col]) => c + ':' + col).join(' '));
