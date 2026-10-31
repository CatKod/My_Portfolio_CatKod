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
import { execFileSync } from 'node:child_process';
import { buildCvHtml } from './cv.mjs';

const OUT_DIR = 'site/pdf';
const OUT = OUT_DIR + '/CV_Hoang-Kim-Vinh_2026.pdf';
const HTML = 'tmp_cv.html';

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
      '--print-to-pdf=' + OUT.replace(/\//g, '\\'),
      'file:///' + HTML.replace(/\\/g, '/'),
    ],
    { stdio: 'ignore' },
  );
  console.log('đã tạo', OUT);
} catch {
  console.log('không xuất được PDF — bỏ qua bước sinh CV PDF');
}
