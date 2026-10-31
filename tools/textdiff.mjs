import { readFileSync } from 'node:fs';

const ROUTES = ['index.html', 'about', 'work', 'skills', 'credentials', 'guestbook', 'contact'];

function split(file) {
  const s = readFileSync(file, 'utf8');
  const flightRe = /self\.__next_f\.push\(\[1,"(?:[^"\\]|\\.)*"\]\)/g;
  let flight = '';
  let dom = '';
  let last = 0;
  for (const m of s.matchAll(flightRe)) {
    dom += s.slice(last, m.index);
    last = m.index + m[0].length;
    const b = m[0].slice(m[0].indexOf(',"') + 2, m[0].lastIndexOf('"'));
    try {
      flight += JSON.parse('"' + b + '"');
    } catch {
      /* ignore */
    }
  }
  dom += s.slice(last);
  return { dom, flight };
}

function domTexts(dom) {
  const bodyMatch = dom.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : dom;
  body = body.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const out = [];
  for (const m of body.matchAll(/>([^<>]+)</g)) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (t) out.push(t);
  }
  return out;
}

for (const r of ROUTES) {
  const a = split('site.orig.bak/' + r);
  const b = split('site/' + r);
  const ta = domTexts(a.dom);
  const tb = domTexts(b.dom);
  const setA = new Set(ta);
  const setB = new Set(tb);
  const onlyA = [...setA].filter((x) => !setB.has(x));
  const onlyB = [...setB].filter((x) => !setA.has(x));
  console.log('###', r, 'domTexts', ta.length, '->', tb.length);
  if (onlyA.length) console.log('  removed:', JSON.stringify(onlyA).slice(0, 600));
  if (onlyB.length) console.log('  added  :', JSON.stringify(onlyB).slice(0, 600));
}
