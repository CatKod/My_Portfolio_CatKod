import { readFileSync } from 'node:fs';

const html = readFileSync(process.argv[2], 'utf8');
const days = [];
// gh-container theo tuần
const tdRe = /data-date="([\d-]+)"[^>]*data-level="(\d)"[^>]*class="ContributionCalendar-day"[\s\S]*?<tool-tip[^>]*for="contribution-day-component-(\d+)-(\d+)"[^>]*>([^<]*)<\/tool-tip>/g;
let m;
while ((m = tdRe.exec(html)) !== null) {
  const tip = m[5].trim();
  let count = 0;
  const cm = /(\d+) contributions?/.exec(tip);
  if (cm) count = Number(cm[1]);
  days.push({ date: m[1], level: Number(m[2]), week: Number(m[3]), day: Number(m[4]), count, tip });
}
console.log('parsed', days.length);
console.log(JSON.stringify(days.slice(0, 3)));
console.log(JSON.stringify(days.slice(-3)));
const total = days.reduce((s, d) => s + d.count, 0);
console.log('total', total);
