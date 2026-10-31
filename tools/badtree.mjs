import { readFileSync } from 'node:fs';

const file = process.argv[2];
const s = readFileSync(file, 'utf8');
const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
let flight = '';
for (const m of s.matchAll(re)) {
  try {
    flight += JSON.parse(m[1]);
  } catch {
    /* ignore */
  }
}
const rows = new Map();
for (const line of flight.split('\n')) {
  const m = line.match(/^([0-9a-f]+):(.*)$/);
  if (!m) continue;
  rows.set(m[1], m[2]);
}
for (const [id, raw] of rows) {
  if (!raw.startsWith('[')) continue;
  // tìm chỗ "["$","$Lxx" bị hỏng -> ["$"null
  const bad = raw.match(/\[\"\$\"(?!\])[^\]]{0,40}/g);
  if (bad) console.log('row', id, 'BROKEN:', JSON.stringify(bad.slice(0, 5)));
}
// kiểm tra JSON hợp lệ của từng hàng cây
for (const [id, raw] of rows) {
  if (!raw.startsWith('[')) continue;
  try {
    JSON.parse(raw);
  } catch (e) {
    console.log('row', id, 'INVALID JSON:', e.message);
  }
}
console.log('done');
