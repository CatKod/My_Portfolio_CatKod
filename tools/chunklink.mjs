import fs from 'fs';
import path from 'path';
const dir = 'site/_next/static/chunks';
const files = fs.readdirSync(dir);
const refs = new Map();
for (const f of files) {
  if (!f.endsWith('.js')) continue;
  const s = fs.readFileSync(path.join(dir, f), 'utf8');
  const re = /_next\/static\/chunks\/([^"'\\)\s]+)/g;
  const set = new Set();
  let m;
  while ((m = re.exec(s))) set.add(m[1]);
  refs.set(f, set);
}
let bad = 0;
for (const [f, set] of refs) {
  for (const r of set) {
    if (!fs.existsSync(path.join(dir, r))) {
      console.log('THIẾU', f, '->', r);
      bad++;
    }
  }
}
console.log(bad ? bad + ' tham chiếu hỏng' : 'mọi tham chiếu chunk trong chunk đều tồn tại');
