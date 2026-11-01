/**
 * Deploy lên repo GitHub Pages theo đúng pipeline của repo:
 *
 *   1. prepareDeploy.mjs  — site/ -> deploy/ (route không đuôi -> thư mục
 *                            kèm index.html, bỏ file không dùng, thêm .nojekyll)
 *   2. syncPages.mjs      — deploy/ -> repo Pages (giữ README.md)
 *   3. syncLegacyChunks.mjs — ghi đè các file chunk thế hệ cũ (tên .catkod.<hash>)
 *                            bằng nội dung đã vá, để trình duyệt đang cache HTML
 *                            cũ vẫn nhận được bản sửa thay vì 404.
 *
 * Bắt buộc phải qua bước 1: GitHub Pages phục vụ file không đuôi với
 * Content-Type `application/octet-stream`, khiến trình duyệt tải file thay vì
 * render trang.
 */
import { execFileSync } from 'node:child_process';

const run = (script, ...args) =>
  execFileSync('node', ['tools/' + script, ...args], { stdio: 'inherit' });

console.log('=== 1/3 prepareDeploy (site -> deploy) ===');
run('prepareDeploy.mjs', 'site', 'deploy');

console.log('\n=== 2/3 syncPages (deploy -> repo Pages) ===');
run('syncPages.mjs', 'deploy', 'D:/GitHub/CatKod.github.io.pages');

console.log('\n=== 3/3 syncLegacyChunks (alias thế hệ cũ) ===');
run('syncLegacyChunks.mjs');

console.log('\nHoàn tất. Kiểm tra trước khi push:');
console.log('  cd D:/GitHub/CatKod.github.io.pages && git status && git diff --cached');
