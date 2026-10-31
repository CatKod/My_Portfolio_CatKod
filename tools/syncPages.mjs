/**
 * Đồng bộ thư mục `deploy/` sang repo GitHub Pages.
 *
 * Giữ nguyên `README.md` của repo Pages (nội dung giới thiệu riêng, không
 * nằm trong `deploy/`), còn lại mọi file đều lấy từ bản deploy.
 */
import fs from 'node:fs';
import path from 'node:path';

const src = path.resolve(process.argv[2] || 'deploy');
const dest = path.resolve(process.argv[3] || 'D:/GitHub/CatKod.github.io.pages');

const KEEP = new Set(['README.md', '.git']);

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

// 1) Xoá mọi thứ trừ README.md và .git
for (const e of fs.readdirSync(dest, { withFileTypes: true })) {
  if (KEEP.has(e.name)) continue;
  rmrf(path.join(dest, e.name));
}

// 2) Copy toàn bộ deploy sang
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, e.name);
    const d = path.join(to, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
copyDir(src, dest);

console.log('đã đồng bộ', src, '->', dest);
console.log('giữ lại README.md');
