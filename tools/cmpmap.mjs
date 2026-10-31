import { readFileSync } from 'node:fs';
import { ICON_MAP } from './icons.mjs';

const t = readFileSync('site/_next/static/chunks/15nsyxl.8hl16.js', 'utf8');
const i = t.indexOf('let tw={');
const s = t.indexOf('{', i);
// quét cân bằng object
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
const keysA = Object.keys(parsed).sort();
const keysB = Object.keys(ICON_MAP).sort();
console.log('chunk keys', keysA.length, 'ours', keysB.length);
const onlyA = keysA.filter((k) => !keysB.includes(k));
const onlyB = keysB.filter((k) => !keysA.includes(k));
console.log('only in chunk:', onlyA.join(', ') || '-');
console.log('only in ours :', onlyB.join(', ') || '-');
for (const k of keysA) {
  if (!keysB.includes(k)) continue;
  const a = parsed[k], b = ICON_MAP[k];
  if (a.slug !== b.slug || (a.variant ?? 'default') !== (b.variant ?? 'default')) {
    console.log('DIFF', k, JSON.stringify(a), JSON.stringify(b));
  }
}
