import { readFileSync } from 'node:fs';

function outline(html, startTag) {
  const i = html.indexOf(startTag);
  if (i < 0) return [];
  const seg = html.slice(i);
  const out = [];
  const re = /<(\/?)([a-z0-9]+)\b([^>]*)>/gi;
  let m;
  const stack = [];
  let started = false;
  while ((m = re.exec(seg))) {
    const close = m[1] === '/';
    const tag = m[2];
    const self = m[0].endsWith('/>');
    if (!started) {
      if (!close) {
        started = true;
        const cls = (m[3].match(/class="([^"]*)"/) || [])[1] || '';
        out.push('  '.repeat(0) + tag + '.' + cls);
        if (!self) stack.push(tag);
      }
      continue;
    }
    if (close) {
      stack.pop();
      if (!stack.length) break;
      continue;
    }
    const cls = (m[3].match(/class="([^"]*)"/) || [])[1] || '';
    out.push('  '.repeat(stack.length) + tag + '.' + cls);
    if (!self) stack.push(tag);
  }
  return out;
}

const which = process.argv[2] || 'site/credentials';
const tag = process.argv[3] || 'credentials-board';
const html = readFileSync(which, 'utf8');
console.log(outline(html, tag).join('\n'));
