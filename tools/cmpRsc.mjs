import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const staticFile = process.argv[2];
const rscFile = process.argv[3];

const sHtml = readFileSync(staticFile, 'utf8');
const sLines = [];
for (const p of splitFile(sHtml)) {
  if (p.kind !== 'flight') continue;
  for (const l of splitLines(p.text)) sLines.push(l.raw);
}
const rLines = readFileSync(rscFile, 'utf8').split('\n').filter((l) => l !== '');

console.log('static lines:', sLines.length, ' rsc lines:', rLines.length);

let same = 0;
for (let i = 0; i < Math.max(sLines.length, rLines.length); i++) {
  const a = sLines[i];
  const b = rLines[i];
  if (a === b) {
    same++;
    continue;
  }
  if (a === undefined) {
    console.log(`[${i}] ONLY IN RSC: ${b.slice(0, 110)}`);
    continue;
  }
  if (b === undefined) {
    console.log(`[${i}] ONLY IN STATIC: ${a.slice(0, 110)}`);
    continue;
  }
  // tìm điểm khác biệt đầu tiên
  let k = 0;
  while (k < Math.min(a.length, b.length) && a[k] === b[k]) k++;
  console.log(`[${i}] DIFF@${k}`);
  console.log(`   static: ${a.slice(Math.max(0, k - 40), k + 70)}`);
  console.log(`   rsc   : ${b.slice(Math.max(0, k - 40), k + 70)}`);
}
console.log('identical lines:', same);
