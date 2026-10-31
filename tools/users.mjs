import { readFileSync } from 'node:fs';

const f = process.argv[2];
const s = readFileSync(f, 'utf8');
const lines = s.split('\n');
lines.forEach((l, i) => {
  if (!l.trim()) return;
  let o;
  try { o = JSON.parse(l); } catch { return; }
  const role = o.role || (o.message && o.message.role) || '';
  if (role !== 'user') return;
  const msg = o.message || o;
  const content = msg.content;
  let text = '';
  if (typeof content === 'string') text = content;
  else if (Array.isArray(content)) {
    text = content
      .map((c) => {
        if (c.type === 'text') return c.text;
        if (c.type === 'tool_result') {
          return 'TOOL_RESULT: ' + JSON.stringify(c.content).slice(0, 1200);
        }
        return '';
      })
      .join('\n');
  }
  if (!text) return;
  if (text.includes('<available_subagent_types>')) return;
  console.log('=== line', i, '===');
  console.log(text.slice(0, 2500));
});
