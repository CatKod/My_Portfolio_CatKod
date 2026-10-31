import { readFileSync, writeFileSync } from 'node:fs';

const t = readFileSync('site/_next/static/chunks/15nsyxl.8hl16.js', 'utf8');
const i = t.indexOf('let tw={');
const s = t.indexOf('{', i);
let depth = 0, inStr = false, esc = false, j = s;
for (; j < t.length; j++) {
  const ch = t[j];
  if (inStr) {
    if (esc) esc = false;
    else if (ch === '\\') esc = true;
    else if (ch === '"') inStr = false;
    continue;
  }
  if (ch === '"') { inStr = true; continue; }
  if (ch === '{') depth++;
  else if (ch === '}') { depth--; if (depth === 0) { j++; break; } }
}
const raw = t.slice(s, j);
const parsed = JSON.parse(raw.replace(/([{,])(\w+):/g, '$1"$2":'));
writeFileSync('tools/iconmap.json', JSON.stringify(parsed, null, 2), 'utf8');
console.log('keys', Object.keys(parsed).length);
console.log(Object.keys(parsed).sort().join(' | '));
