import { readFileSync } from 'node:fs';

const html = readFileSync(process.argv[2], 'utf8');
const re = /data-level="(\d)"[\s\S]{0,700}?<tool-tip[^>]*>([^<]*)<\/tool-tip>/g;
let m;
let n = 0;
while ((m = re.exec(html)) !== null && n < 12) {
  console.log('level', m[1], '->', m[2].trim());
  n++;
}
