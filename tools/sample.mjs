import { readPng } from './pngdiff.mjs';

const a = readPng(process.argv[2]);
const b = readPng(process.argv[3]);
const [x0, y0, x1, y1] = process.argv.slice(4).map(Number);

function stats(img, label) {
  let min = [255, 255, 255], max = [0, 0, 0], sum = [0, 0, 0], n = 0;
  const uniq = new Set();
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * img.width + x) * 4;
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], img.data[i + k]);
        max[k] = Math.max(max[k], img.data[i + k]);
        sum[k] += img.data[i + k];
      }
      n++;
      if (uniq.size < 5000) uniq.add(`${img.data[i]},${img.data[i + 1]},${img.data[i + 2]}`);
    }
  }
  console.log(label, 'min', min, 'max', max, 'avg', sum.map(s => (s / n).toFixed(1)), 'uniqueColors', uniq.size);
}
stats(a, 'A');
stats(b, 'B');

// sample grid
for (let y = y0; y < y1; y += Math.max(1, Math.floor((y1 - y0) / 6))) {
  const row = [];
  for (let x = x0; x < x1; x += Math.max(1, Math.floor((x1 - x0) / 10))) {
    const i = (y * a.width + x) * 4, j = (y * b.width + x) * 4;
    row.push(`${a.data[i]},${a.data[i + 1]},${a.data[i + 2]} | ${b.data[i]},${b.data[i + 1]},${b.data[i + 2]}`);
  }
  console.log('y=' + y, row.join('  '));
}
