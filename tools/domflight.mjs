import { readFileSync } from 'node:fs';
import { splitFile } from './flight.mjs';

const file = process.argv[2];
const parts = splitFile(readFileSync(file, 'utf8'));
let dom = '', flight = '';
for (const p of parts) {
  if (p.kind === 'raw') dom += p.text;
  else flight += p.text;
}

// DOM text nodes (outside script)
const bodyMatch = dom.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyMatch ? bodyMatch[1] : dom;
body = body.replace(/<script[\s\S]*?<\/script>/gi, '');

// Flight children strings
const fl = new Set();
for (const m of flight.matchAll(/"children":"((?:[^"\\]|\\.)*)"/g)) {
  try { fl.add(JSON.parse('"' + m[1] + '"')); } catch {}
}

const domTokens = [...body.matchAll(/>([^<>]+)</g)].map((m) => m[1].replace(/\s+/g, ' ').trim()).filter(Boolean);

const missing = [];
for (const t of domTokens) {
  if (!fl.has(t)) missing.push(t);
}
console.log('dom tokens:', domTokens.length, 'flight children:', fl.size, 'missing:', missing.length);
for (const t of missing.slice(0, 40)) console.log('  MISSING:', JSON.stringify(t).slice(0, 140));
