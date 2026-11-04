/**
 * Sinh CV PDF cho Hoàng Kim Vĩnh.
 *
 * Nguồn nội dung: `tools/profile.mjs` — cùng nguồn với các trang của site,
 * nên CV không lệch với portfolio.
 *
 * Xuất PDF bằng headless Chrome (không cần thư viện PDF ngoài). Nếu Chrome
 * không có trên máy, script báo cáo và bỏ qua — site vẫn chạy được.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { PDF_DIR, CV_PDF } from '../config/paths.mjs';
import { execFileSync } from 'node:child_process';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCvHtml } from '../lib/cv.mjs';
import { normalizePdfFile } from '../lib/pdfMeta.mjs';

const OUT_DIR = PDF_DIR;
const OUT = CV_PDF;
const HTML = join(dirname(fileURLToPath(import.meta.url)), 'tmp_cv.html');

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

function findChrome() {
  for (const c of CHROME_CANDIDATES) if (existsSync(c)) return c;
  return null;
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(HTML, buildCvHtml(), 'utf8');

const chrome = findChrome();
if (!chrome) {
  console.log('không tìm thấy Chrome/Edge — bỏ qua bước sinh CV PDF');
  process.exit(0);
}

try {
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      // Đường dẫn tuyệt đối: Chrome headless ghi PDF theo đường dẫn truyền vào,
      // nếu là đường dẫn tương đối thì nó ghi ra file khác (hoặc bỏ qua) mà
      // không báo lỗi — CV cũ vẫn nằm trên đĩa và tưởng như đã sinh lại.
      '--print-to-pdf=' + resolve(OUT),
      'file:///' + resolve(HTML).replace(/\\/g, '/'),
    ],
    { stdio: 'ignore' },
  );
  // Chuẩn hoá metadata để PDF có tính tất định (xem tools/lib/pdfMeta.mjs).
  normalizePdfFile(OUT);
  console.log('đã tạo', OUT);
} catch {
  console.log('không xuất được PDF — bỏ qua bước sinh CV PDF');
}
