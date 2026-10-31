import { readFileSync, writeFileSync } from 'node:fs';

const f = 'tools/build.mjs';
let t = readFileSync(f, 'utf8');

const from = 'M18 22H4a2 2 0 1-2-2V6';
const to = 'M18 22H4a2 2 0 0 1-2-2V6';
console.log('found:', t.includes(from));
t = t.split(from).join(to);
writeFileSync(f, t, 'utf8');
console.log('written');
