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

/** Thu thập chuỗi lá theo thứ tự từ cây flight. */
function flightLeaves(value, out) {
  if (value === null || value === undefined) return out;
  if (Array.isArray(value)) {
    for (const v of value) flightLeaves(v, out);
    return out;
  }
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k === 'children') {
        if (typeof v === 'string') out.push(v);
        else flightLeaves(v, out);
      } else {
        flightLeaves(v, out);
      }
    }
    return out;
  }
  return out;
}

const rows = new Map();
for (const line of flight.split('\n')) {
  const m = line.match(/^([0-9a-f]+):(.*)$/);
  if (!m) continue;
  try {
    rows.set(m[1], JSON.parse(m[2]));
  } catch {
    /* ignore */
  }
}

const leaves = [];
for (const [id, v] of rows) {
  if (/^[0-9a-f]/.test(id) && /^[0-9a-f]$/.test(id)) {
    flightLeaves(v, leaves);
  }
}

const bodyMatch = dom.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyMatch ? bodyMatch[1] : dom;
body = body.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');

const domLeaves = [];
for (const m of body.matchAll(/>([^<>]+)</g)) {
  const t = m[1].replace(/\s+/g, ' ').trim();
  if (t) domLeaves.push(t);
}

console.log('DOM leaves', domLeaves.length, 'flight leaves', leaves.length);
const n = Math.max(domLeaves.length, leaves.length);
let diff = 0;
for (let i = 0; i < n; i++) {
  if (domLeaves[i] !== leaves[i]) {
    diff++;
    if (diff <= 40) console.log(`#${i} DOM=${JSON.stringify(domLeaves[i])?.slice(0, 90)} FL=${JSON.stringify(leaves[i])?.slice(0, 90)}`);
  }
}
console.log('total diffs', diff);
