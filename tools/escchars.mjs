import { readFileSync } from 'node:fs';

const s = readFileSync(process.argv[2], 'utf8');
const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
let all = '';
for (const m of s.matchAll(re)) all += m[1];
const escs = new Set([...all.matchAll(/\\(.)/g)].map((m) => m[1]));
console.log('escape chars:', [...escs].map((c) => JSON.stringify(c)).join(' '));
console.log('has \\u escape:', /\\u[0-9a-fA-F]{4}/.test(all));
