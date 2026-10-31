import { readFileSync } from 'node:fs';
const h = readFileSync(process.argv[2], 'utf8');
const c = {};
for (const m of h.matchAll(/fill="(#[0-9a-fA-F]{6})" height="10"/g)) c[m[1]] = (c[m[1]] || 0) + 1;
console.log(c);
const levels = {};
for (const m of h.matchAll(/<title>([^<]*?): (\d+) GitHub contributions<\/title>/g)) levels[m[2]] = (levels[m[2]] || 0) + 1;
console.log(levels);
