import { readFileSync } from 'node:fs';

const f = process.argv[2];
const lines = readFileSync(f, 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (!l.trim()) continue;
  let o;
  try {
    o = JSON.parse(l);
  } catch {
    continue;
  }
  const content = o.message?.content;
  if (!Array.isArray(content)) continue;
  for (const c of content) {
    if (c.type === 'tool_use' && c.name === 'ask_question') {
      console.log('=== line', i);
      console.log(JSON.stringify(c.input, null, 1).slice(0, 6000));
    }
  }
}
