/**
 * Dọn các thế hệ chunk cũ (xa hơn 2 thế hệ gần nhất).
 *
 * ============================================================================
 * TẠI SAO GIỮ NHIỀU THẾ HỆ
 * ============================================================================
 * HTML của GitHub Pages bị cache `max-age=600` (10 phút), nhưng người dùng có
 * thể giữ tab mở từ lâu, hoặc trình duyệt cache HTML lâu hơn hạn. Nếu chỉ
 * deploy một bản rồi xoá ngay file cũ, người dùng có HTML cache sẽ nhận
 * 404 cho asset và thấy trang không có style — tệ hơn nhiều so với thấy bản cũ.
 *
 * Vì vậy: giữ lại 2 thế hệ gần nhất. Thế hệ cũ hơn bị xoá. Đây cũng là cách
 * Next.js/Vercel xử lý asset có content-hash (giữ file cũ trên CDN).
 *
 * Manifest thế hệ do `renameChunks.mjs` ghi vào `.generations.json`.
 */
import { readFileSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const chunkDir = 'site/_next/static/chunks';
const manifestPath = join(chunkDir, '.generations.json');
const KEEP_GENERATIONS = 2;

let generations = [];
try {
  generations = JSON.parse(readFileSync(manifestPath, 'utf8')).generations || [];
} catch {
  console.log('chưa có manifest thế hệ, bỏ qua dọn dẹp');
  process.exit(0);
}

if (generations.length <= KEEP_GENERATIONS) {
  console.log(
    'giữ ' + generations.length + ' thế hệ (giữ tối đa ' + KEEP_GENERATIONS + '), không cần dọn',
  );
  process.exit(0);
}

const keep = new Set(generations.slice(0, KEEP_GENERATIONS).flat());
const drop = generations.slice(KEEP_GENERATIONS).flat();

let removed = 0;
for (const f of new Set(drop)) {
  const p = join(chunkDir, f);
  if (keep.has(f)) continue;
  if (!existsSync(p)) continue;
  unlinkSync(p);
  removed++;
  console.log('đã xoá (thế hệ cũ):', f);
}

console.log('đã dọn ' + removed + ' file thuộc thế hệ cũ');
