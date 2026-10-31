/**
 * Tìm vị trí các media query trong file CSS để biết rule nào thuộc desktop.
 *
 * Site dùng breakpoint riêng (không phải 768px mặc định), nên khi sửa phải
 * đặt rule vào đúng khối media query, nếu không mobile sẽ bị đổi bố cục.
 */
import fs from 'fs';
import path from 'path';

const dir = 'site/_next/static/chunks';

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.css')) continue;
  const s = fs.readFileSync(path.join(dir, f), 'utf8');
  // Quét cân bằng ngoặc để tìm @media
  let i = 0;
  let depth = 0;
  let start = -1;
  const medias = [];
  while (i < s.length) {
    const at = s.indexOf('@media', i);
    if (at === -1) break;
    // tìm '{' và '}' tương ứng
    let b = s.indexOf('{', at);
    let d = 0;
    let j = b;
    for (; j < s.length; j++) {
      if (s[j] === '{') d++;
      else if (s[j] === '}') {
        d--;
        if (d === 0) break;
      }
    }
    medias.push({ at, end: j, cond: s.slice(at, b).trim() });
    i = j + 1;
  }
  console.log('[' + f + '] ' + medias.length + ' media query');
  for (const m of medias) {
    console.log('  @' + m.at + '  ' + m.cond + '   (len ' + (m.end - m.at) + ')');
  }
}
