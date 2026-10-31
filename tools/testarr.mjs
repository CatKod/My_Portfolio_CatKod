import { readFileSync } from 'node:fs';
import { splitFile, joinFile } from './flight.mjs';

const html = readFileSync('site.orig.bak/work', 'utf8');
const parts = splitFile(html);

function spanOfArray(text, open) {
  let depth = 0, inStr = false, escCh = false, j = open;
  for (; j < text.length; j++) {
    const ch = text[j];
    if (inStr) {
      if (escCh) escCh = false;
      else if (ch === '\\') escCh = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) { j++; break; } }
  }
  return { start: open, end: j };
}

// giống hệt replaceFlightArray trong rebrand.mjs
function replaceFlightArray(parts, key, value) {
  const needle = `${key}":[`;
  console.log('needle =', JSON.stringify(needle));
  return parts.map((p) => {
    if (p.kind === 'raw') return p;
    const i = p.text.indexOf(needle);
    console.log('  idx', i);
    if (i < 0) return p;
    const span = spanOfArray(p.text, i + needle.length - 1);
    const arr = JSON.stringify(value);
    console.log('  span', span, 'arrlen', arr.length);
    return { ...p, text: p.text.slice(0, span.start) + arr + p.text.slice(span.end) };
  });
}

const out = replaceFlightArray(parts, '"projects"', [{ slug: 'TEST' }]);
const res = joinFile(out);
console.log('has TEST', res.includes('TEST'), 'has kpn', res.includes('kpn-profile-company'));
