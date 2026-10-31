import { readFileSync } from 'node:fs';

for (const f of process.argv.slice(2)) {
  const s = readFileSync(f, 'utf8');
  const re = /self\.__next_f\.push\((\[[^\]]*(?:\][^\]]*)*?\])\)/g;
  const out = [];
  for (const m of s.matchAll(/self\.__next_f\.push\((.*?)\)<\/script>/gs)) {
    out.push(m[1].slice(0, 60));
  }
  console.log('===', f, 'pushes:', out.length);
  out.forEach((x, i) => console.log('  ', i + 1, x));
}
