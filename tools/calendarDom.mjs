/**
 * Dựng lại khối "contribution-panel" (biểu đồ hoạt động GitHub) từ dữ liệu
 * calendar.json — phải khớp BYTE với output của client component
 * `GitHubActivity` (site/_next/static/chunks/09f~j.yqvpkh..js) để SSR HTML
 * và RSC flight không lệch nhau.
 *
 * Thuật toán bản gốc:
 *  - Mỗi tuần -> mảng 7 ô, đặt theo `weekday`, phần còn lại là placeholder.
 *  - `level` suy từ màu GitHub, fallback theo số lần đóng góp.
 *  - Ô: 10x10, cách nhau 3px (step 13), viewBox rộng = 10*w + (w-1)*3, cao 88.
 *  - Nhãn tháng: tuần có ngày kết thúc bằng "-01", hoặc tuần đầu tiên.
 */

const LEVEL_COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Chuẩn hoá ngày -> "Oct 30" (đúng `toLocaleDateString('en', {day:'numeric',month:'short'})`). */
function fmtDate(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${MONTHS_EN[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** Tính level từ màu / số lần đóng góp (giống hàm `level` của site gốc). */
function levelOf(day) {
  if (day.contributionCount === 0) return 0;
  switch (String(day.color).toLowerCase()) {
    case '#9be9a8':
    case '#0e4429':
      return 1;
    case '#40c463':
    case '#006d32':
      return 2;
    case '#30a14e':
    case '#26a641':
      return 3;
    case '#216e39':
    case '#39d353':
      return 4;
  }
  if (day.contributionCount >= 15) return 4;
  if (day.contributionCount >= 10) return 3;
  if (day.contributionCount >= 5) return 2;
  return 1;
}

/** Nhãn tháng: tuần chứa ngày "-01", hoặc tuần đầu. */
function monthLabels(weeks) {
  const out = [];
  weeks.forEach((week, wi) => {
    const days = week.contributionDays || [];
    const first = days.find((d) => d.date.endsWith('-01'));
    const pick = first ?? (wi === 0 ? days[0] : null);
    if (!pick) return;
    if (wi === 0 || first) {
      const d = new Date(`${pick.date}T12:00:00Z`);
      out.push({
        key: `month-${wi}-${pick.date}`,
        label: MONTHS_EN[d.getUTCMonth()],
        startWeek: wi,
      });
    }
  });
  const count = weeks.length;
  return out.map((m, i) => ({
    ...m,
    span: (out[i + 1]?.startWeek ?? count) - m.startWeek,
  }));
}

/**
 * Dựng toàn bộ panel.
 * @param {{weeks: Array, totalContributions: number}} calendar
 */
export function buildPanel(calendar) {
  const weeks = calendar.weeks || [];
  const labels = monthLabels(weeks);

  const monthSpans = labels
    .map(
      (l) =>
        `<span style="grid-column:${l.startWeek + 1} / span ${l.span}">${l.label}</span>`,
    )
    .join('');

  const rects = [];
  weeks.forEach((week, wi) => {
    const byWeekday = new Array(7).fill(null);
    for (const day of week.contributionDays || []) {
      byWeekday[day.weekday] = day;
    }
    byWeekday.forEach((day, di) => {
      if (!day) return; // placeholder -> không render
      const level = levelOf(day);
      const title = `${fmtDate(day.date)}: ${day.contributionCount} GitHub contribution${
        day.contributionCount === 1 ? '' : 's'
      }`;
      rects.push(
        `<rect fill="${LEVEL_COLORS[level]}" height="10" rx="2" width="10" x="${
          13 * wi
        }" y="${13 * di}"><title>${title}</title></rect>`,
      );
    });
  });

  const width = 10 * weeks.length + (weeks.length - 1) * 3;

  return (
    '<div class="contribution-panel">' +
    '<div class="contribution-calendar">' +
    `<div aria-hidden="true" class="contribution-months" style="grid-template-columns:repeat(${weeks.length}, 10px)">${monthSpans}</div>` +
    '<div class="contribution-body">' +
    '<div aria-hidden="true" class="contribution-days"><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span></div>' +
    `<svg aria-label="GitHub contribution heatmap" class="contribution-grid-svg" height="88" role="img" viewBox="0 0 ${width} 88" width="${width}">${rects.join(
      '',
    )}</svg>` +
    '</div></div>' +
    `<div class="contribution-summary"><span>${calendar.totalContributions}<!-- --> contributions</span><span>last year</span></div>` +
    '</div>'
  );
}
