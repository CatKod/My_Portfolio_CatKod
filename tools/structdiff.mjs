import { readFileSync } from 'node:fs';

const ROUTES = ['index.html', 'about', 'work', 'skills', 'credentials', 'guestbook', 'contact'];

function domOf(file) {
  const s = readFileSync(file, 'utf8');
  const flightRe = /self\.__next_f\.push\(\[1,"(?:[^"\\]|\\.)*"\]\)/g;
  let dom = '';
  let last = 0;
  for (const m of s.matchAll(flightRe)) {
    dom += s.slice(last, m.index);
    last = m.index + m[0].length;
  }
  dom += s.slice(last);
  return dom;
}

function tags(dom) {
  const bodyMatch = dom.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : dom;
  body = body.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const out = [];
  for (const m of body.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g)) {
    const closing = m[1] === '/';
    const name = m[2].toLowerCase();
    const attrs = m[3];
    const cls = (attrs.match(/class="([^"]*)"/) || [, ''])[1];
    out.push({ closing, name, cls });
  }
  return out;
}

for (const r of ROUTES) {
  const a = tags(domOf('site.orig.bak/' + r));
  const b = tags(domOf('site/' + r));
  console.log('###', r, 'tags', a.length, '->', b.length);
  // so sánh chuỗi class theo thứ tự
  const ca = a.filter((t) => !t.closing).map((t) => t.name + '.' + t.cls);
  const cb = b.filter((t) => !t.closing).map((t) => t.name + '.' + t.cls);
  const sa = new Set(ca);
  const sb = new Set(cb);
  const onlyA = [...sa].filter((x) => !sb.has(x));
  const onlyB = [...sb].filter((x) => !sa.has(x));
  if (onlyA.length) console.log('  chỉ có ở ORIG:', JSON.stringify(onlyA).slice(0, 700));
  if (onlyB.length) console.log('  chỉ có ở NEW :', JSON.stringify(onlyB).slice(0, 700));
}
