import { readFileSync } from 'node:fs';

const t = readFileSync(process.argv[2], 'utf8');
const colors = [...t.matchAll(/"color":"(#[0-9a-fA-F]{6})"/g)].map(m => m[1]);
const counts = {};
for (const c of colors) counts[c] = (counts[c] || 0) + 1;
console.log('colors:', counts);
const weeks = (t.match(/"weeks":\[/) || []).length;
console.log('weeks blocks:', weeks);
const i = t.indexOf('"totalContributions"');
console.log(JSON.stringify(t.slice(i - 100, i + 400)));
