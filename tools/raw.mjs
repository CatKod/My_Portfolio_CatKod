import { readFileSync } from 'node:fs';

const f = process.argv[2];
const from = Number(process.argv[3]);
const to = Number(process.argv[4]);
const s = readFileSync(f, 'utf8');
const lines = s.split('\n');
for (let i = from; i < Math.min(to, lines.length); i++) {
  const l = lines[i];
  if (!l.trim()) continue;
  console.log('=== line', i, 'len', l.length);
  console.log(l.slice(0, 800));
}
