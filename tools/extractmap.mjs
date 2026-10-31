import { readdirSync, readFileSync } from 'node:fs';
const dir = 'site/_next/static/chunks';
const target = '15nsyxl.8hl16.js';
const s = readFileSync(dir + '/' + target, 'utf8');
// Tìm object literal dạng {"Next.js":{slug:"nextdotjs",variant:"mono"},...}
const re = /\{[^{}]*"[A-Za-z][^:]*:\{slug:"[a-z0-9-]+"(?:,variant:"[a-z]+")?\}[^{}]*\}/g;
let m;
let best = null;
for (const x of s.matchAll(re)) {
  if (!best || x[0].length > best[0].length) best = x;
}
if (!best) {
  console.log('không tìm thấy');
} else {
  console.log('len', best[0].length);
  console.log(best[0].slice(0, 400));
  console.log('...');
  console.log(best[0].slice(-300));
}
