import fs from 'fs';
const file = process.argv[2];
const html = fs.readFileSync(file, 'utf8');

// Tách phần DOM (bỏ script) và phần flight
const flightRe = /self\.__next_f\.push\(\[1,"(?:[^"\\]|\\.)*"\]\)/g;
let flight = '';
let dom = '';
let last = 0;
for (const m of html.matchAll(flightRe)) {
  dom += html.slice(last, m.index);
  last = m.index + m[0].length;
  const b = m[0].slice(m[0].indexOf(',"') + 2, m[0].lastIndexOf('"'));
  try { flight += JSON.parse('"' + b + '"'); } catch { /* ignore */ }
}
dom += html.slice(last);

const bodyMatch = dom.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyMatch ? bodyMatch[1] : dom;
body = body.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');

// Text node của DOM (bỏ thẻ, gộp whitespace)
const domText = body
  .replace(/<[^>]+>/g, '\n')
  .split('\n')
  .map((s) => s.replace(/\s+/g, ' ').trim())
  .filter(Boolean);

// Text node của flight payload (mọi chuỗi nằm trong "children" hoặc là text node thuần)
const flText = new Set();
for (const m of flight.matchAll(/"children":"((?:[^"\\]|\\.)*)"/g)) {
  try { flText.add(JSON.parse('"' + m[1] + '"')); } catch { /* ignore */ }
}
for (const m of flight.matchAll(/"children":\[("(?:[^"\\]|\\.)*")/g)) {
  try { flText.add(JSON.parse(m[1])); } catch { /* ignore */ }
}
// text node trực tiếp: ,"text"
for (const m of flight.matchAll(/,"((?:[^"\\]|\\.)*)"(?=[,\]\}])/g)) {
  try { flText.add(JSON.parse('"' + m[1] + '"')); } catch { /* ignore */ }
}

const missing = domText.filter((t) => !flText.has(t) && t.length > 1);
console.log('DOM text nodes:', domText.length, '| flight strings:', flText.size);
console.log('DOM text không có trong flight:', missing.length);
for (const t of missing.slice(0, 40)) console.log('  ' + JSON.stringify(t).slice(0, 120));
