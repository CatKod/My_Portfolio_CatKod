import { readFileSync } from 'node:fs';
import { splitFile } from './flight.mjs';

const file = process.argv[2];
const parts = splitFile(readFileSync(file, 'utf8'));
let dom = '', flight = '';
for (const p of parts) {
  if (p.kind === 'raw') dom += p.text;
  else flight += p.text;
}

const bodyMatch = dom.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyMatch ? bodyMatch[1] : dom;
body = body.replace(/<script[\s\S]*?<\/script>/gi, '');

const domText = body.replace(/<[^>]+>/g, '\u0001').split('\u0001').map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
const domSet = new Set(domText);

const fl = new Set();
for (const m of flight.matchAll(/"children":"((?:[^"\\]|\\.)*)"/g)) {
  try { fl.add(JSON.parse('"' + m[1] + '"')); } catch {}
}

const notInDom = [...fl].filter(t => !domSet.has(t));
console.log(file, 'flight children:', fl.size, 'not found in SSR DOM:', notInDom.length);
for (const t of notInDom) console.log('  FLIGHT-ONLY:', JSON.stringify(t).slice(0, 160));
