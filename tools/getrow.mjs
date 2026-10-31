import { readFileSync } from 'node:fs';

const file = process.argv[2];
const want = process.argv[3];
const s = readFileSync(file, 'utf8');
const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
for (const m of s.matchAll(re)) {
  let d = '';
  try {
    d = JSON.parse(m[1]);
  } catch {
    continue;
  }
  for (const line of d.split('\n')) {
    const mm = line.match(/^([0-9a-f]+):(.*)$/);
    if (!mm) continue;
    if (mm[1] !== want) continue;
    console.log('row', mm[1], 'len', mm[2].length);
    console.log(mm[2]);
  }
}
