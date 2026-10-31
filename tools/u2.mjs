import { readFileSync } from 'node:fs';
const f = process.argv[2];
const from = Number(process.argv[3] || 0);
const to = Number(process.argv[4] || 1e9);
const s = readFileSync(f, 'utf8');
const lines = s.split('\n');
for (let i = from; i < Math.min(to, lines.length); i++) {
  const l = lines[i];
  if (l.includes('role":"user') && !l.includes('available_subagent_types')) {
    console.log('L' + i, l.slice(0, 1500));
    console.log('===');
  }
}
