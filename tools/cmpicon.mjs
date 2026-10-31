import fs from 'fs';
import { ICON_MAP } from './icons.mjs';

const file = 'site/_next/static/chunks/15nsyxl.8hl16.js';
const s = fs.readFileSync(file, 'utf8');
const i = s.indexOf('let tw={');
const start = s.indexOf('{', i);
let d = 0, j = start;
for (; j < s.length; j++) {
  const c = s[j];
  if (c === '{') d++;
  else if (c === '}') { d--; if (d === 0) { j++; break; } }
}
const src = s.slice(start, j);
const obj = eval('(' + src.replace(/([{,])(\w+):/g, '$1"$2":') + ')');

const ck = Object.keys(obj), mk = Object.keys(ICON_MAP);
console.log('client-only:', ck.filter((k) => !(k in ICON_MAP)));
console.log('icons-only:', mk.filter((k) => !(k in obj)));
for (const k of ck) {
  if (k in ICON_MAP) {
    const a = JSON.stringify(obj[k]), b = JSON.stringify(ICON_MAP[k]);
    if (a !== b) console.log('DIFF', k, a, b);
  }
}
