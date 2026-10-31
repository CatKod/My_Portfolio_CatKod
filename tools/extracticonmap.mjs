import { readFileSync } from 'node:fs';
import { writeFileSync } from 'node:fs';

const s = readFileSync('site/_next/static/chunks/15nsyxl.8hl16.js', 'utf8');
// Icon map bắt đầu bằng {"AI SDKs":{...} hoặc tương tự
const start = s.indexOf('{"AI SDKs"');
if (start < 0) {
  console.log('không tìm thấy đầu map');
  process.exit(1);
}
let depth = 0;
let i = s.indexOf('{', start);
let inStr = false;
let esc = false;
let end = -1;
for (; i < s.length; i++) {
  const c = s[i];
  if (inStr) {
    if (esc) esc = false;
    else if (c === '\\') esc = true;
    else if (c === '"') inStr = false;
    continue;
  }
  if (c === '"') { inStr = true; continue; }
  if (c === '{') depth++;
  else if (c === '}') {
    depth--;
    if (depth === 0) { end = i + 1; break; }
  }
}
const raw = s.slice(start, end);
console.log('len', raw.length);
// chuyển thành JSON hợp lệ
const json = raw.replace(/([{,])\s*([A-Za-z][A-Za-z0-9 .+/#-]*)\s*:/g, '$1"$2":').replace(/'/g, '"');
const obj = JSON.parse(json);
console.log('entries', Object.keys(obj).length);
writeFileSync('tools/iconmap.react.json', JSON.stringify(obj, null, 2), 'utf8');
console.log('đã ghi tools/iconmap.react.json');
