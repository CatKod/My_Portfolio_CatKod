import { readFileSync } from 'node:fs';
const h = readFileSync(process.argv[2], 'utf8');
const re = /<rect fill="(#[0-9a-fA-F]{6})" height="10"[^>]*x="(\d+)" y="(\d+)"><title>([^<]*?): (\d+) GitHub contribution(s?)<\/title>/g;
const pairs = {};
const re2 = /<rect fill="(#[0-9a-fA-F]{6})" height="10"[^>]*><title>([^<]*?)<\/title>/g;
let m;
while ((m = re2.exec(h)) !== null) {
  const tip = m[2];
  const cm = /(\d+) GitHub contribution/.exec(tip);
  const count = cm ? Number(cm[1]) : 0;
  const key = m[1];
  pairs[key] = pairs[key] || [];
  pairs[key].push(count);
}
for (const [k, v] of Object.entries(pairs)) {
  const nz = v.filter(x => x > 0);
  console.log(k, 'total', v.length, 'nonzero', nz.length, 'min', Math.min(...v), 'max', Math.max(...v));
}
