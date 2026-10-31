import { readFileSync } from 'node:fs';

const t = readFileSync(process.argv[2], 'utf8');
// Find the JSON-ish props objects: locate keys of interest
const keys = (process.argv[3] || '').split(',').filter(Boolean);
for (const k of keys) {
  const idx = t.indexOf(k);
  if (idx < 0) { console.log('NOT FOUND: ' + k); continue; }
  console.log('=== key "' + k + '" @' + idx);
  console.log(t.slice(Math.max(0, idx - 300), idx + 2200));
  console.log();
}
