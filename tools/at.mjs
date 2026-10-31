import { readFileSync } from 'node:fs';

const t = readFileSync(process.argv[2], 'utf8');
const start = Number(process.argv[3] || 0);
const len = Number(process.argv[4] || 3000);
console.log(t.slice(start, start + len));
