import { readFileSync } from 'node:fs';

const file = process.argv[2];
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

// DOM: strip script/style, then tags -> text pieces
const bodyMatch = dom.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyMatch ? bodyMatch[1] : dom;
body = body.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');

const domTexts = [];
for (const m of body.matchAll(/>([^<>]+)</g)) {
  const t = m[1].replace(/\s+/g, ' ').trim();
  if (t) domTexts.push(t);
}

// Flight: collect "children":"..." string values
const flTexts = new Set();
for (const m of flight.matchAll(/"children":"((?:[^"\\]|\\.)*)"/g)) {
  try {
    flTexts.add(JSON.parse('"' + m[1] + '"'));
  } catch {
    /* ignore */
  }
}
for (const m of flight.matchAll(/"children":\["((?:[^"\\]|\\.)*)"\]/g)) {
  try {
    flTexts.add(JSON.parse('"' + m[1] + '"'));
  } catch {
    /* ignore */
  }
}

const missing = domTexts.filter((t) => !flTexts.has(t));
console.log('DOM text nodes:', domTexts.length, 'flight children strings:', flTexts.size);
console.log('--- DOM texts not found in flight children (' + missing.length + '):');
for (const t of missing) console.log('  ', JSON.stringify(t).slice(0, 200));
