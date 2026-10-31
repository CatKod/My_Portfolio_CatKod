import fs from 'fs';
const f = fs.readFileSync(process.argv[2], 'utf8');
const needles = process.argv.slice(3);
for (const l of f.split('\n')) {
  const i = l.indexOf(':');
  if (i < 1) continue;
  const key = l.slice(0, i);
  const val = l.slice(i + 1);
  for (const n of needles) {
    if (val.includes(n)) console.log(key, 'has', n, 'len=' + val.length);
  }
}
