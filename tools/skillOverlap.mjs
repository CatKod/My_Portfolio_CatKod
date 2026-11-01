/**
 * Tìm lỗi chồng chữ ở ĐÚNG tỉ lệ màn hình của người dùng.
 *
 * Người dùng có 3 màn 1920x1080, Windows scale 125%.
 * Cốc Cốc (Chromium) maximized: vùng render web 1865x939 px vật lý
 *   => viewport CSS thật = 1865/1.25 x 939/1.25 = 1492 x 751
 *
 * Script này dò tự động selector chứa "skill"/"chip", đo rect từng chip và
 * phát hiện chồng lấn (text overlap) ở nhiều tỉ lệ.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/';
mkdirSync(OUT, { recursive: true });

const URL = 'https://catkod.github.io/';

const VIEWPORTS = [
  [1492, 751, 'user-real'],
  [1440, 751, 'vp1440x751'],
  [1536, 751, 'vp1536x751'],
  [1492, 700, 'vp1492x700'],
  [1492, 800, 'vp1492x800'],
  [1600, 751, 'vp1600x751'],
  [1366, 768, 'vp1366x768'],
  [1280, 800, 'vp1280x800'],
  [1920, 1080, 'vp1920x1080'],
];

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

const errors = [];
const failed = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 120));
});
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message.slice(0, 120)));
page.on('response', (r) => {
  if (r.status() >= 400) failed.push(r.status() + ' ' + r.url().split('/').pop());
});

// --- 1. Khám phá DOM: tìm selector chứa "skill" / "chip" ---
await page.setViewportSize({ width: 1492, height: 751 });
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const discovery = await page.evaluate(() => {
  const out = { classes: new Map(), samples: [] };
  const all = [...document.querySelectorAll('*')];
  for (const el of all) {
    const cn = typeof el.className === 'string' ? el.className : '';
    if (!cn) continue;
    for (const c of cn.split(/\s+/)) {
      if (/skill|chip|tag|pill|badge|stack|row/i.test(c)) {
        if (!out.classes.has(c)) out.classes.set(c, { count: 0, tag: el.tagName, sample: '' });
        const e = out.classes.get(c);
        e.count++;
        if (!e.sample) e.sample = el.textContent.trim().slice(0, 40);
      }
    }
  }
  out.classes = [...out.classes.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 40);
  return out;
});

console.log('=== các class liên quan (top 40 theo số phần tử) ===');
for (const c of discovery.classes) {
  console.log(`  ${String(c.count).padStart(4)}  ${c.name}  <${c.tag}>  "${c.sample}"`);
}

// --- 2. Đo ở từng viewport ---
console.log('\n=== đo theo viewport ===');
const report = [];

for (const [w, h, label] of VIEWPORTS) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const data = await page.evaluate(() => {
    const rect = (el) => {
      const b = el.getBoundingClientRect();
      return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
    };

    // tìm tập phần tử skill: chọn class có nhiều phần tử con giống nhau
    const counts = new Map();
    for (const el of document.querySelectorAll('*')) {
      const cn = typeof el.className === 'string' ? el.className : '';
      if (!cn) continue;
      for (const c of cn.split(/\s+/)) {
        if (/skill|chip/i.test(c)) counts.set(c, (counts.get(c) || 0) + 1);
      }
    }
    let chipSel = null;
    let best = 0;
    for (const [c, n] of counts) if (n > best) { best = n; chipSel = '.' + CSS.escape(c); }
    if (!chipSel) return { error: 'không tìm thấy chip' };

    const chips = [...document.querySelectorAll(chipSel)];
    const boxes = chips.map((el) => ({
      rect: rect(el),
      text: el.textContent.trim().slice(0, 30),
      overflow: getComputedStyle(el).overflow,
      display: getComputedStyle(el).display,
      lineHeight: getComputedStyle(el).lineHeight,
      fontSize: getComputedStyle(el).fontSize,
      height: getComputedStyle(el).height,
    }));

    // chồng lấn giữa các chip (theo trục y)
    const overlaps = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i].rect, b = boxes[j].rect;
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (ox > 0 && oy > 0) overlaps.push({ i, j, ox: +ox.toFixed(1), oy: +oy.toFixed(1), ti: boxes[i].text, tj: boxes[j].text });
      }
    }

    // chồng chữ bên trong: các element text con có rect chồng nhau
    const textOverlaps = [];
    for (const chip of chips) {
      const kids = [...chip.querySelectorAll('*')].filter((k) => {
        const s = getComputedStyle(k);
        return s.display !== 'inline' && k.textContent.trim().length > 0;
      });
      for (let i = 0; i < kids.length; i++) {
        for (let j = i + 1; j < kids.length; j++) {
          const a = rect(kids[i]), b = rect(kids[j]);
          const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
          const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
          if (ox > 1 && oy > 1) textOverlaps.push({ chip: chip.textContent.trim().slice(0, 25), ox: +ox.toFixed(1), oy: +oy.toFixed(1) });
        }
      }
    }

    return {
      chipSel,
      chipCount: chips.length,
      chipRect: boxes.length ? boxes[0].rect : null,
      boxes: boxes.slice(0, 8),
      overlaps: overlaps.slice(0, 12),
      overlapCount: overlaps.length,
      textOverlaps: textOverlaps.slice(0, 12),
      textOverlapCount: textOverlaps.length,
      docScrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
    };
  });

  report.push({ label, w, h, ...data });
  console.log(
    `\n[${label}] ${w}x${h}  selector=${data.chipSel}  chips=${data.chipCount}  ` +
      `chipOverlap=${data.overlapCount}  textOverlap=${data.textOverlapCount}  ` +
      `scrollW=${data.docScrollW}/${data.innerW}`,
  );
  if (data.chipRect) console.log(`   chip[0]:`, JSON.stringify(data.chipRect));
  for (const o of (data.overlaps || []).slice(0, 4)) {
    console.log(`   OVERLAP chip#${o.i}"${o.ti}" x chip#${o.j}"${o.tj}"  ox=${o.ox} oy=${o.oy}`);
  }
  for (const o of (data.textOverlaps || []).slice(0, 4)) {
    console.log(`   TEXT-OVERLAP in "${o.chip}"  ox=${o.ox} oy=${o.oy}`);
  }

  await page.screenshot({ path: OUT + 'skill-' + label + '.png', fullPage: true });
}

console.log('\n=== TÓM TẮT ===');
console.log('viewport       chips  chipOverlap  textOverlap');
for (const r of report) {
  console.log(
    `${String(r.label).padEnd(14)} ${String(r.chipCount ?? '-').padStart(5)} ` +
      `${String(r.overlapCount ?? '-').padStart(11)} ${String(r.textOverlapCount ?? '-').padStart(12)}`,
  );
}

console.log('\nconsole errors:', errors.length ? errors.slice(0, 5) : 'none');
console.log('failed requests:', failed.length ? failed.slice(0, 5) : 'none');

await browser.close();
