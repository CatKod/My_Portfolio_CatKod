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

const bodyMatch = dom.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyMatch ? bodyMatch[1] : dom;
body = body.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');

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

// Group DOM text by nearest class attr for context
const tokens = [...body.matchAll(/(?:class="([^"]*)")?[^<>]*>([^<>]+)</g)];
const missing = [];
for (const m of tokens) {
  const t = m[2].replace(/\s+/g, ' ').trim();
  if (!t) continue;
  if (!flTexts.has(t)) missing.push({ cls: m[1] || '', t });
}
console.log('missing count', missing.length);
for (const x of missing) console.log('  [' + x.cls.slice(0, 60) + '] ' + JSON.stringify(x.t).slice(0, 120));
