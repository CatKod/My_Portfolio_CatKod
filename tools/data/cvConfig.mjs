/**
 * Cấu hình 6 bản CV (2 kiểu × 3 ngôn ngữ).
 *
 * Nguồn file: `tools/data/cv/` — bản HTML do thiết kế riêng, nằm trong repo
 * để build không phụ thuộc repo khác.
 *
 * Quy tắc chọn bản theo ngôn ngữ đang dùng trên site:
 *   - `vi` → bản tiếng Việt
 *   - `ja` → bản tiếng Nhật
 *   - còn lại → bản tiếng Anh (site dùng Google Translate cho các ngôn ngữ
 *     khác, nên CV cũng nên ở tiếng Anh cho nhất quán)
 */

/** Hai kiểu bố cục. */
export const CV_STYLES = ['classic', 'modern'];

/** Ba ngôn ngữ có bản riêng. */
export const CV_LANGUAGES = ['en', 'vi', 'ja'];

/** Ngôn ngữ dùng khi site đang ở ngôn ngữ khác (Google Translate). */
export const CV_FALLBACK_LANGUAGE = 'en';

/**
 * Bản CV dùng cho mỗi kiểu.
 * @type {Record<string, string>} khóa -> tên file trong `tools/data/cv/`
 */
export const CV_FILES = {
  'classic-en': 'cv-classic-en.html',
  'classic-vi': 'cv-classic-vi.html',
  'classic-ja': 'cv-classic-ja.html',
  'modern-en': 'cv-modern-en.html',
  'modern-vi': 'cv-modern-vi.html',
  'modern-ja': 'cv-modern-ja.html',
};

/** Ảnh đi kèm (CV kiểu modern dùng `avatar.jpg`). */
export const CV_ASSETS = ['avatar.jpg', 'photo.jpg'];

/**
 * Chọn bản CV theo kiểu và ngôn ngữ.
 *
 * @param {string} style 'classic' | 'modern'
 * @param {string} language mã ngôn ngữ của site ('en', 'vi', 'ja', 'ko', ...)
 * @returns {string} khóa bản, ví dụ 'modern-vi'
 */
export function cvVariant(style, language) {
  const s = CV_STYLES.includes(style) ? style : CV_STYLES[0];
  const lang = CV_LANGUAGES.includes(language) ? language : CV_FALLBACK_LANGUAGE;
  return `${s}-${lang}`;
}

/** Nhãn hiển thị cho từng kiểu CV. */
export const CV_STYLE_LABELS = {
  classic: 'Classic',
  modern: 'Modern',
};
