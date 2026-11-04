/**
 * Sinh dữ liệu lịch đóng góp GitHub cho CatKod từ HTML thật.
 * Kết quả khớp cấu trúc mà component GitHubActivity mong đợi.
 *
 * Dùng:  node tools/verify/calendar.mjs
 *   - đọc  : tools/data/gh_catkod.html  (HTML GitHub thô, tải tay từ
 *             https://github.com/CatKod?tab=overview&from=2025-10-26&to=2026-10-31)
 *   - ghi   : tools/data/calendar.json
 *
 * `gh_catkod.html` là input thô tải tay từ GitHub nên KHÔNG commit (nó thay
 * đổi theo thời gian). Bản đã phân tích (`calendar.json`) thì có commit, nên
 * clone repo mới vẫn build được mà không cần file thô. Script này chỉ cần
 * chạy lại khi muốn cập nhật số liệu contribution.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { GH_PROFILE_HTML, CALENDAR_FILE } from '../config/paths.mjs';

if (!existsSync(GH_PROFILE_HTML)) {
  console.error(
    `thiếu ${GH_PROFILE_HTML}\n` +
      'Tải trang GitHub (mở devtools > copy outerHTML) rồi lưu vào file đó,\n' +
      'hoặc bỏ qua bước này — calendar.json đã commit sẵn trong repo.',
  );
  process.exit(1);
}

const html = readFileSync(GH_PROFILE_HTML, 'utf8');

const LEVEL_COLOR = {
  0: '#ebedf0',
  1: '#9be9a8',
  2: '#40c463',
  3: '#30a14e',
  4: '#216e39',
};

// Quét từng ô: data-date, data-level, và tooltip chứa số lượng.
const cellRe = /data-date="([\d-]+)"[^>]*id="contribution-day-component-\d+-\d+"[^>]*data-level="(\d)"[\s\S]*?<tool-tip[^>]*>([^<]*)<\/tool-tip>/g;
const cells = [];
let m;
while ((m = cellRe.exec(html)) !== null) {
  const tip = m[3].trim();
  const cm = /(\d+) contributions?/.exec(tip);
  cells.push({
    date: m[1],
    level: Number(m[2]),
    count: cm ? Number(cm[1]) : 0,
  });
}

if (!cells.length) {
  console.error('không đọc được ô nào');
  process.exit(1);
}

cells.sort((a, b) => (a.date < b.date ? -1 : 1));

// Chia thành tuần, mỗi tuần bắt đầu từ Chủ nhật (weekday 0).
const weeks = [];
let current = [];
for (const cell of cells) {
  const weekday = new Date(cell.date + 'T12:00:00Z').getUTCDay();
  if (current.length && weekday === 0) {
    weeks.push(current);
    current = [];
  }
  current.push({ ...cell, weekday });
}
if (current.length) weeks.push(current);

const total = cells.reduce((s, c) => s + c.count, 0);
const first = cells[0].date;
const last = cells[cells.length - 1].date;

const calendar = {
  from: `${first}T00:00:00.000Z`,
  generatedAt: `${last}T12:00:00.000Z`,
  login: 'CatKod',
  to: `${last}T23:59:59.000Z`,
  totalContributions: total,
  weeks: weeks.map(w => ({
    contributionDays: w.map(d => ({
      date: d.date,
      contributionCount: d.count,
      color: LEVEL_COLOR[d.level] || LEVEL_COLOR[0],
      weekday: d.weekday,
    })),
  })),
};

writeFileSync(CALENDAR_FILE, JSON.stringify(calendar, null, 2), 'utf8');
console.log('weeks', weeks.length, 'days', cells.length, 'total', total);
console.log('first', first, 'last', last);
console.log('week0', JSON.stringify(calendar.weeks[0].contributionDays));
console.log('-> ' + CALENDAR_FILE);
