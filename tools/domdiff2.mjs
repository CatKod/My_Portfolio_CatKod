import { readFileSync } from 'node:fs';
import { splitFile } from './flight.mjs';

function domOf(file) {
  const parts = splitFile(readFileSync(file, 'utf8'));
  let dom = '';
  for (const p of parts) if (p.kind === 'raw') dom += p.text;
  return dom;
}

/** Flatten DOM into list of "tag|attr=val" paths with text. */
function flatten(html) {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let body = m ? m[1] : html;
  body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
  const out = [];
  const re = /<(\/?)([a-zA-Z0-9-]+)([^>]*)>|([^<]+)/g;
  let depth = 0;
  let x;
  while ((x = re.exec(body)) !== null) {
    if (x[2]) {
      if (x[1] === '/') { depth--; continue; }
      const attrs = (x[3] || '').trim().replace(/\s+/g, ' ');
      out.push('  '.repeat(Math.max(0, depth)) + `<${x[2]} ${attrs}>`);
      if (!/\/>$/.test(x[3] || '') && !['img', 'br', 'hr', 'input', 'meta', 'link'].includes(x[2].toLowerCase())) depth++;
    } else {
      const t = x[4].replace(/\s+/g, ' ').trim();
      if (t) out.push('  '.repeat(Math.max(0, depth)) + 'TEXT:' + t);
    }
  }
  return out;
}

const a = flatten(domOf(process.argv[2]));
const b = flatten(domOf(process.argv[3]));
const n = Math.max(a.length, b.length);
let shown = 0;
for (let i = 0; i < n; i++) {
  if (a[i] !== b[i]) {
    console.log('DIFF @', i);
    console.log('  A:', JSON.stringify(a[i] || '').slice(0, 200));
    console.log('  B:', JSON.stringify(b[i] || '').slice(0, 200));
    if (++shown >= 15) break;
  }
}
if (!shown) console.log('DOM STRUCTURE IDENTICAL');
