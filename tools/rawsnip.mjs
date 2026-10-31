import { readFileSync } from 'node:fs';

const file = process.argv[2];
const s = readFileSync(file, 'utf8');
const idx = s.indexOf('function dropFlightLines');
console.log('idx', idx);
console.log(JSON.stringify(s.slice(idx, idx + 700)));
