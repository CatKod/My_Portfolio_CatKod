import { readFileSync } from 'node:fs';
const f = process.argv[2];
const s = readFileSync(f, 'utf8');
const lines = s.split('\n');
lines.forEach((l, i) => {
  if (l.includes('selected') || l.includes('Selected')) {
    console.log('L' + i, l.slice(0, 2000));
    console.log('===');
  }
});
