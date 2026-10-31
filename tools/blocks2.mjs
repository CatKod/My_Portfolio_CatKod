import { readFileSync } from 'node:fs';

for (const f of process.argv.slice(2)) {
  const s = readFileSync(f, 'utf8');
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let i = 0;
  let n = 0;
  console.log('===', f);
  for (const m of s.matchAll(re)) {
    i++;
    let d = '';
    try {
      d = JSON.parse(m[1]);
    } catch {
      continue;
    }
    const ids = [...d.matchAll(/(^|\n)([0-9a-f]+):/g)].map((x) => x[2]);
    n++;
    console.log('  block', i, 'rows:', ids.join(','));
  }
  console.log('  total blocks', n);
}
