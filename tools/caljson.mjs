import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let flight = '';
for (const p of parts) if (p.kind === 'flight') flight += decodeFlight(p.text);

const i = flight.indexOf('"calendar":{');
if (i < 0) { console.log('not found'); process.exit(1); }
let k = flight.indexOf('{', i + 10);
let depth = 0, inStr = false, esc = false;
const start = k;
for (; k < flight.length; k++) {
  const ch = flight[k];
  if (inStr) {
    if (esc) esc = false;
    else if (ch === '\\') esc = true;
    else if (ch === '"') inStr = false;
    continue;
  }
  if (ch === '"') { inStr = true; continue; }
  if (ch === '{') depth++;
  else if (ch === '}') { depth--; if (depth === 0) { k++; break; } }
}
const cal = JSON.parse(flight.slice(start, k));
console.log('from', cal.from, 'to', cal.to, 'login', cal.login, 'total', cal.totalContributions);
console.log('weeks', cal.weeks.length);
const days = cal.weeks.flatMap(w => w.contributionDays);
console.log('days', days.length);
const pairs = new Map();
for (const d of days) {
  if (!pairs.has(d.contributionCount)) pairs.set(d.contributionCount, new Set());
  pairs.get(d.contributionCount).add(d.color);
}
console.log([...pairs.keys()].sort((a, b) => a - b).map(c => c + ':' + [...pairs.get(c)].join('/')).join(' '));
console.log('sum', days.reduce((s, d) => s + d.contributionCount, 0));
console.log('first', JSON.stringify(days[0]), 'last', JSON.stringify(days[days.length - 1]));
// weekday của ngày đầu
console.log('week0 len', cal.weeks[0].contributionDays.length, 'lastweek len', cal.weeks[cal.weeks.length - 1].contributionDays.length);
