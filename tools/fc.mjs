import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const file = process.argv[2] || 'site.orig.bak/credentials';
const cls = process.argv[3] || 'credential-certificate-list';
const html = readFileSync(file, 'utf8');

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

const key = `"className":"${cls}","children":[`;
for (const p of splitFile(html)) {
  if (p.kind === 'raw') continue;
  for (const l of splitLines(p.text)) {
    let i = l.body.indexOf(key);
    while (i >= 0) {
      const span = spanOfArray(l.body, i + key.length - 1);
      console.log(`--- part${p.index} id=${l.id}`);
      console.log(l.body.slice(span.start, span.end));
      i = l.body.indexOf(key, span.end);
    }
  }
}
