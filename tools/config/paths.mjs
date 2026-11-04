/**
 * Đường dẫn gốc của repo — nguồn duy nhất cho mọi script.
 *
 * Mọi script trong `tools/` đều chạy từ repo root (`node tools/...`), nên
 * đường dẫn tương đối như `site/_next/...` là ổn định. Nhưng khi script nằm
 * trong subfolder (`tools/build/`, `tools/deploy/`...) và được `import` bởi
 * script khác, đường dẫn tương đối sẽ hỏng. File này giải quyết bằng cách
 * neo mọi đường dẫn vào repo root một lần, đọc từ `import.meta.url`.
 *
 * Cách dùng:
 *   import { SITE_DIR, CHUNKS_DIR, rel } from '../config/paths.mjs';
 *   readFileSync(rel('site/index.html'), 'utf8');
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Thư mục `tools/`. */
export const TOOLS_DIR = path.resolve(HERE, '..');

/** Thư mục gốc repo. */
export const ROOT = path.resolve(TOOLS_DIR, '..');

/** Bản site gốc (upstream) — input bắt buộc của bước reset chunk. */
export const ORIG_DIR = path.join(ROOT, 'site.orig.bak');

/** Site tĩnh đã build, sẽ publish. */
export const SITE_DIR = path.join(ROOT, 'site');

/** Chunk JS/CSS của Next.js trong site đã build. */
export const CHUNKS_DIR = path.join(SITE_DIR, '_next', 'static', 'chunks');

/** Bản deploy chuẩn bị cho GitHub Pages. */
export const DEPLOY_DIR = path.join(ROOT, 'deploy');

/** Thư mục chứa ảnh dự án. */
export const IMAGES_DIR = path.join(SITE_DIR, 'images');

/** File CV sinh ra. */
export const CV_PDF = path.join(SITE_DIR, 'pdf', 'CV_Hoang-Kim-Vinh_2026.pdf');

/** Repo GitHub Pages đích. Có thể override bằng biến môi trường. */
export const PAGES_REPO = process.env.CATKOD_PAGES_REPO ?? 'D:/GitHub/CatKod.github.io.pages';

/**
 * Đổi một đường dẫn tương đối (theo repo root) thành đường dẫn tuyệt đối.
 * Dùng cho mọi lệnh đọc/ghi file để không phụ thuộc thư mục làm việc.
 */
export const rel = (...parts) => path.join(ROOT, ...parts);

/** Đường dẫn tương đối từ repo root, dùng để in ra log cho dễ đọc. */
export const relToRoot = (abs) => path.relative(ROOT, abs) || '.';
