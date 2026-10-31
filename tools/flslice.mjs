import { readFileSync } from 'node:fs';
const f = readFileSync(process.argv[3] || 'tools/fl_skills.txt', 'utf8');
const start = f.indexOf(process.argv[2]);
if (start === -1) { console.log('not found'); process.exit(0); }
console.log(f.slice(start, start + Number(process.argv[4] || 4000)));
