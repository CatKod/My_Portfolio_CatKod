import { readFileSync } from 'node:fs';

const file = process.argv[2];
const needle = process.argv[3];
const html = readFileSync(file, 'utf8');
let idx = 0;
let n = 0;
while ((idx = html.indexOf(needle, idx)) !== -1) {
  n++;
  const start = Math.max(0, idx - 700);
  const end = Math.min(html.length, idx + 500);
  console.log(`\n===== #${n} @ ${idx} =====`);
  console.log(html.slice(start, end));
  idx += needle.length;
}
console.log(`\ntotal ${n}`);
