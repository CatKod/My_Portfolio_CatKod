import { readFileSync } from 'node:fs';

const css = readFileSync('site/_next/static/chunks/0kv4a-p~1zj9b.catkod.1bb0b6dd.css', 'utf8');

// Strip out all @media blocks and inspect what remains
let noMedia = '';
let pos = 0;
while (pos < css.length) {
  const mediaIdx = css.indexOf('@media', pos);
  if (mediaIdx === -1) {
    noMedia += css.slice(pos);
    break;
  }
  noMedia += css.slice(pos, mediaIdx);
  const braceOpen = css.indexOf('{', mediaIdx);
  let depth = 1;
  let i = braceOpen + 1;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
    i++;
  }
  pos = i;
}

const rules = noMedia.match(/[^\{\}]+?\{[^\{\}]+\}/g) || [];
console.log('--- BASE RULES (DESKTOP) ---');
for (const r of rules) {
  if (r.includes('.home-') || r.includes('.stage--home')) {
    console.log(r.trim());
  }
}
