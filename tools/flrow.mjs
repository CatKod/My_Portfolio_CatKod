import fs from 'fs';
const f = fs.readFileSync(process.argv[2], 'utf8');
const key = process.argv[3];
for (const l of f.split('\n')) {
  const i = l.indexOf(':');
  if (i < 1) continue;
  if (l.slice(0, i) === key) {
    console.log(l.slice(i + 1));
  }
}
