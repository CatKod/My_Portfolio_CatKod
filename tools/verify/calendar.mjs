/**
 * Sinh dữ liệu lịch đóng góp GitHub cho CatKod từ HTML thật.
 * Kết quả khớp cấu trúc mà component GitHubActivity mong đợi.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync(process.argv[2] || 'gh_catkod.html', 'utf8');

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

writeFileSync(process.argv[3] || 'calendar.json', JSON.stringify(calendar, null, 2), 'utf8');
console.log('weeks', weeks.length, 'days', cells.length, 'total', total);
console.log('first', first, 'last', last);
console.log('week0', JSON.stringify(calendar.weeks[0].contributionDays));
