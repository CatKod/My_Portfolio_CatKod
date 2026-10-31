import { readFileSync } from 'node:fs';

const f = process.argv[2];
const from = Number(process.argv[3] || 1000);
const to = Number(process.argv[4] || 1060);
const s = readFileSync(f, 'utf8');
const lines = s.split('\n');
for (let i = from; i < Math.min(to, lines.length); i++) {
  const l = lines[i];
  if (!l.trim()) continue;
  let o;
  try { o = JSON.parse(l); } catch { continue; }
  const role = o.role || (o.message && o.message.role) || '';
  if (role !== 'assistant') continue;
  const content = (o.message || o).content;
  if (!Array.isArray(content)) continue;
  for (const c of content) {
    if (c.type === 'text' && c.text.trim()) {
      console.log('--- line', i);
      console.log(c.text.slice(0, 3000));
    }
  }
}
