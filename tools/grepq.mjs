import { readFileSync } from 'node:fs';

const f = process.argv[2];
const needle = process.argv[3];
const s = readFileSync(f, 'utf8');
const lines = s.split('\n');
lines.forEach((l, i) => {
  if (!l.includes(needle)) return;
  let o;
  try { o = JSON.parse(l); } catch { console.log(i, 'RAW', l.slice(0, 1200)); return; }
  console.log('=== line', i, 'role', o.role || (o.message && o.message.role));
  console.log(JSON.stringify(o).slice(0, 2000));
});
