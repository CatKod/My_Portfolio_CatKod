/**
 * Chuẩn bị bản deploy cho GitHub Pages.
 *
 * Điều chỉnh so với bản dựng trong `site/`:
 *  - Route không có đuôi (`about`, `work`, ...) được đổi thành thư mục kèm
 *    `index.html`. GitHub Pages phục vụ file không đuôi với
 *    `application/octet-stream`, khiến trình duyệt tải file thay vì render.
 *  - Thêm `.nojekyll` để tắt Jekyll, vì Jekyll sẽ bỏ qua thư mục bắt đầu bằng
 *    `_` (`_next`) và xử lý lại nội dung HTML.
 */
import fs from 'fs';
import path from 'path';

const src = path.resolve(process.argv[2] || 'site');
const dest = path.resolve(process.argv[3] || 'deploy');

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

const ROUTES = ['about', 'work', 'skills', 'credentials', 'guestbook', 'contact'];

/** File tồn tại trong bản gốc nhưng không còn dùng sau khi đổi thương hiệu. */
const UNUSED = new Set(['irfan.svg']);

let copied = 0;
let routes = 0;
const skipped = [];

for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
  const from = path.join(src, entry.name);

  if (entry.isDirectory()) {
    fs.cpSync(from, path.join(dest, entry.name), { recursive: true });
    copied++;
    continue;
  }

  if (ROUTES.includes(entry.name)) {
    const dir = path.join(dest, entry.name);
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(from, path.join(dir, 'index.html'));
    routes++;
    continue;
  }

  if (UNUSED.has(entry.name)) {
    skipped.push(entry.name);
    continue;
  }

  fs.copyFileSync(from, path.join(dest, entry.name));
  copied++;
}

// Tắt Jekyll để giữ nguyên `_next/` và cấu trúc file thô.
fs.writeFileSync(path.join(dest, '.nojekyll'), '');

console.log('copied ' + copied + ' entries, ' + routes + ' routes converted to directories');
if (skipped.length) console.log('skipped unused: ' + skipped.join(', '));
console.log('-> ' + dest);
