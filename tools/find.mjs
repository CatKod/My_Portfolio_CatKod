import { readFileSync } from 'node:fs';

const file = process.argv[2];
const needles = process.argv.slice(3);
const html = readFileSync(file, 'utf8');
for (const n of needles) {
  let i = html.indexOf(n);
  let c = 0;
  while (i >= 0 && c < 12) {
    console.log(`[${n}] @${i}:`, JSON.stringify(html.slice(Math.max(0, i - 200), i + 200)));
    i = html.indexOf(n, i + 1);
    c++;
  }
}
