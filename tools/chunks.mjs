import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const html = readFileSync(process.argv[2], 'utf8');
const chunks = new Map();
for (const p of splitFile(html)) {
  if (p.kind !== 'flight') continue;
  for (const l of splitLines(p.text)) {
    const m = /I\[\d+,\[([^\]]*)\],"([^"]+)"/.exec(l.body);
    if (!m) continue;
    const list = m[1].split(',').map((s) => s.replace(/"/g, ''));
    chunks.set(m[2], list.join(' '));
  }
}
for (const [name, list] of chunks) console.log(name.padEnd(28), list);
