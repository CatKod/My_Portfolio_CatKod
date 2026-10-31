import { readFileSync } from 'node:fs';

const html = readFileSync(process.argv[2], 'utf8');
const days = [...html.matchAll(/data-date="([\d-]+)"[^>]*data-level="(\d)"/g)].map(m => ({
  date: m[1], level: Number(m[2]),
}));
console.log('days', days.length, days[0], days[days.length - 1]);
// count per level
const c = {};
for (const d of days) c[d.level] = (c[d.level] || 0) + 1;
console.log('levels', c);
