import { readFileSync } from 'node:fs';

for (const f of process.argv.slice(2)) {
  const s = readFileSync(f, 'utf8');
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let empty = 0;
  let total = 0;
  for (const m of s.matchAll(re)) {
    total++;
    const d = JSON.parse(m[1]);
    if (d.replace(/\n/g, '').trim() === '') {
      empty++;
      console.log(f, 'EMPTY push #', total, 'at', m.index);
    }
  }
  console.log(f, 'total pushes', total, 'empty', empty);
}
