import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let flight = '';
for (const p of parts) if (p.kind === 'flight') flight += decodeFlight(p.text);

// Tìm các chuỗi text độc lập trong flight (dạng "children":"..." hoặc "..." đứng riêng)
const re = /"children":"((?:[^"\\]|\\.)*)"/g;
let m;
const vals = new Set();
while ((m = re.exec(flight)) !== null) {
  let s;
  try { s = JSON.parse('"' + m[1] + '"'); } catch { s = m[1]; }
  if (s && !s.startsWith('$') && s.length > 2) vals.add(s);
}
console.log([...vals].sort().join('\n'));
