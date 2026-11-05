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

/** Font/media của Next.js trong site đã build. */
export const MEDIA_DIR = path.join(SITE_DIR, '_next', 'static', 'media');

/** Thư mục chứa CV PDF. */
export const PDF_DIR = path.join(SITE_DIR, 'pdf');

/** Bản deploy chuẩn bị cho GitHub Pages. */
export const DEPLOY_DIR = path.join(ROOT, 'deploy');

/** Thư mục chứa ảnh dự án. */
export const IMAGES_DIR = path.join(SITE_DIR, 'images');

/** File CV sinh ra. */
export const CV_PDF = path.join(PDF_DIR, 'CV_Hoang-Kim-Vinh_2026.pdf');

/** Dữ liệu biểu đồ GitHub của chính CatKod — nguồn cho panel /about. */
export const CALENDAR_FILE = path.join(TOOLS_DIR, 'data', 'calendar.json');

/** HTML GitHub thô dùng để sinh lại CALENDAR_FILE. */
export const GH_PROFILE_HTML = path.join(TOOLS_DIR, 'data', 'gh_catkod.html');

/** Thư mục chứa 6 bản CV HTML nguồn (2 kiểu × 3 ngôn ngữ). */
export const CV_SRC_DIR = path.join(TOOLS_DIR, 'data', 'cv');

/** Thư mục chứa CV sau khi build (được publish cùng site). */
export const CV_OUT_DIR = path.join(SITE_DIR, 'cv');

/** Đường dẫn URL của các bản CV sau khi build. */
export const CV_URL_BASE = '/cv';

/** Repo GitHub Pages đích. Có thể override bằng biến môi trường. */
export const PAGES_REPO = process.env.CATKOD_PAGES_REPO ?? 'D:/GitHub/CatKod.github.io.pages';

/**
 * Đổi một đường dẫn tương đối (theo repo root) thành đường dẫn tuyệt đối.
 * Dùng cho mọi lệnh đọc/ghi file để không phụ thuộc thư mục làm việc.
 */
export const rel = (...parts) => path.join(ROOT, ...parts);
