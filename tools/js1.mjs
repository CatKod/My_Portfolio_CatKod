import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dir = 'site/_next/static/chunks';
const f = process.argv[2];
const needle = process.argv[3];
const before = Number(process.argv[4] || 300);
const after = Number(process.argv[5] || 3000);
const s = readFileSync(path.join(dir, f), 'utf8');
let i = s.indexOf(needle);
if (i === -1) {
  console.log('not found');
} else {
  console.log(s.slice(Math.max(0, i - before), Math.min(s.length, i + after)));
}
