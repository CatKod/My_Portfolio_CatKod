import { readFileSync } from 'node:fs';

const file = process.argv[2];
const s = readFileSync(file, 'utf8');
// tìm mọi chỗ trong HTML chứa "9:" và "e:" ở đầu dòng flight
const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
for (const m of s.matchAll(re)) {
  let d = '';
  try {
    d = JSON.parse(m[1]);
  } catch {
    continue;
  }
  for (const line of d.split('\n')) {
    if (/^(9|e|d|17|27):/.test(line)) console.log('FOUND row start:', line.slice(0, 200));
  }
}
// tìm trong toàn bộ HTML các pattern \"9:\" đã escape
const cnt = (s.match(/9:\\"/g) || []).length;
console.log('escaped 9:" count', cnt);
const idx = s.indexOf('9:\\"');
if (idx > 0) console.log('context:', s.slice(idx - 200, idx + 200));
