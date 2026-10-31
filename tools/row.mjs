import { readFileSync } from 'node:fs';

const t = readFileSync(process.argv[2], 'utf8');
// các dòng flight bắt đầu bằng "<id>:"
const re = /^([0-9a-f]+):/gm;
const ids = [];
let m;
while ((m = re.exec(t)) !== null) ids.push({ id: m[1], at: m.index });
console.log(ids.map(i => i.id).join(' '));
if (process.argv[3]) {
  const want = process.argv[3].split(',');
  for (const w of want) {
    const hit = ids.find(i => i.id === w);
    if (!hit) { console.log('--- MISSING row ' + w); continue; }
    const next = ids.find(i => i.at > hit.at);
    const end = next ? next.at : t.length;
    console.log('--- row ' + w);
    console.log(t.slice(hit.at, end));
  }
}
