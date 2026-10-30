import { readPng } from './pngdiff.mjs';

const a = readPng(process.argv[2]);
const b = readPng(process.argv[3]);
const [x0, y0, x1, y1] = process.argv.slice(4).map(Number);

function histogram(img) {
  const m = new Map();
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * img.width + x) * 4;
      const k = `${img.data[i]},${img.data[i + 1]},${img.data[i + 2]}`;
      m.set(k, (m.get(k) || 0) + 1);
    }
  }
  return [...m.entries()].sort((p, q) => q[1] - p[1]).slice(0, 12);
}
console.log('LOCAL top colors:'); console.log(histogram(a));
console.log('UPSTREAM top colors:'); console.log(histogram(b));

const rows = [];
for (let y = y0; y < y1; y++) {
  let c = 0;
  for (let x = x0; x < x1; x++) {
    const i = (y * a.width + x) * 4;
    if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) c++;
  }
  rows.push(`${y}:${c}`);
}
console.log(rows.join(' '));
