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
 *
 * Repo đích lấy từ biến môi trường `CATKOD_PAGES_REPO`, mặc định là
 * `D:/GitHub/CatKod.github.io.pages` — override được khi làm việc trên máy khác.
 */
import { PAGES_REPO, SITE_DIR, DEPLOY_DIR } from '../config/paths.mjs';
import { runTool } from '../lib/exec.mjs';

console.log('=== 1/3 prepareDeploy (site -> deploy) ===');
runTool('deploy/prepareDeploy.mjs', SITE_DIR, DEPLOY_DIR);

console.log('\n=== 2/3 syncPages (deploy -> repo Pages) ===');
runTool('deploy/syncPages.mjs', DEPLOY_DIR, PAGES_REPO);

console.log('\n=== 3/3 syncLegacyChunks (alias thế hệ cũ) ===');
runTool('deploy/syncLegacyChunks.mjs');

console.log('\nHoàn tất. Kiểm tra trước khi push:');
console.log('  cd ' + PAGES_REPO + ' && git status && git diff --cached');
