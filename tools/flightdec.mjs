import { readFileSync } from 'node:fs';

const file = process.argv[2];
const s = readFileSync(file, 'utf8');
const m = s.match(/self\.__next_f\.push\(\[1,"(?:[^"\\]|\\.)*"\]\)/g) || [];
let d = '';
for (const c of m) {
  const b = c.slice(c.indexOf(',"') + 2, c.lastIndexOf('"'));
  try {
    d += JSON.parse('"' + b + '"');
  } catch {
    /* ignore */
  }
}
console.log(d);
