import { readFileSync } from 'node:fs';

const f = process.argv[2];
const s = readFileSync(f, 'utf8');
const lines = s.split('\n');
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (!l.includes('tool_result')) continue;
  let o;
  try { o = JSON.parse(l); } catch { continue; }
  const content = (o.message || o).content;
  if (!Array.isArray(content)) continue;
  for (const c of content) {
    if (c.type !== 'tool_result') continue;
    const txt = JSON.stringify(c.content);
    if (/selected|answer|option_id|gh-li|studentid|generate|verify/i.test(txt)) {
      console.log('--- line', i, txt.slice(0, 1500));
    }
  }
}
