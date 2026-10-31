/**
 * So sánh icon map của client bundle với `tools/icons.mjs`.
 *
 * Client bundle có sẵn bảng ánh xạ tên stack -> icon CDN. Mọi mục skill mới
 * phải có trong bảng đó, nếu không client sẽ render chữ cái đầu (fallback)
 * trong khi DOM server render vẫn là <img> → hydration mismatch (#418).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { ICON_MAP } from './icons.mjs';

const dir = 'site/_next/static/chunks';
let mapText = null;
let mapFile = null;
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const s = readFileSync(dir + '/' + f, 'utf8');
  const i = s.indexOf('{"AI SDKs":');
  if (i !== -1) {
    mapText = s.slice(i);
    mapFile = f;
    break;
  }
}
if (!mapText) {
  console.log('không tìm thấy icon map trong chunk');
  process.exit(1);
}
console.log('icon map nằm trong', mapFile);

// Cắt tới dấu '}' đầu tiên là kết thúc object literal
let depth = 0;
let end = -1;
for (let i = 0; i < mapText.length; i++) {
  if (mapText[i] === '{') depth++;
  else if (mapText[i] === '}') {
    depth--;
    if (depth === 0) { end = i + 1; break; }
  }
}
const literal = mapText.slice(0, end);
// Object literal của JS không phải JSON (key không quote) → dùng eval an toàn
// trong scope tách biệt vì nội dung đến từ bundle của chính dự án.
const clientMap = new Function('return ' + literal)();

const clientKeys = new Set(Object.keys(clientMap));
const ourKeys = Object.keys(ICON_MAP);

const missing = ourKeys.filter((k) => !clientKeys.has(k));
const extra = [...clientKeys].filter((k) => !ourKeys.includes(k));

console.log('\nclient map có', clientKeys.size, 'mục; tools/icons.mjs có', ourKeys.length);
console.log('\nCó trong icons.mjs nhưng THIẾU trong client map (client sẽ fallback về chữ):');
for (const k of missing) console.log('  -', k, '->', JSON.stringify(ICON_MAP[k]));

console.log('\nCó trong client map nhưng không dùng trong icons.mjs:', extra.length);
