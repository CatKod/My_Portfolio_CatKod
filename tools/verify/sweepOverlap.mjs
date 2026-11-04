/**
 * Quét chồng chữ trên trang chủ theo nhiều tỉ lệ màn hình.
 *
 * Người dùng báo thẻ skill/capability chồng lên text khác. Ảnh chụp của họ là
 * trang chủ (/) ở 1024x575 (ảnh đã thu nhỏ từ viewport thật).
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/';
mkdirSync(OUT, { recursive: true });

const URL = process.argv[2] || 'https://catkod.github.io/';

const WIDTHS = [1100, 1150, 1200, 1250, 1280, 1300, 1350, 1400, 1450, 1492, 1550, 1600, 1700, 1920];
const HEIGHTS = [700, 751, 800, 900];

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

const scan = () =>
  page.evaluate(() => {
    const R = (el) => el.getBoundingClientRect();
    const leaves = [];
    for (const el of document.querySelectorAll('body *')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
      if (!own) continue;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) continue;
      const r = R(el);
      if (r.width < 2 || r.height < 2) continue;
      leaves.push({ el, r, text: el.textContent.trim().slice(0, 32) });
    }
    const hits = [];
    for (let i = 0; i < leaves.length; i++) {
      for (let j = i + 1; j < leaves.length; j++) {
        const A = leaves[i].el, B = leaves[j].el;
        if (A.contains(B) || B.contains(A)) continue;
        const a = leaves[i].r, b = leaves[j].r;
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ox > 2 && oy > 2) {
          hits.push({ a: leaves[i].text, b: leaves[j].text, ox: +ox.toFixed(0), oy: +oy.toFixed(0) });
        }
      }
    }
    hits.sort((x, y) => y.oy - x.oy);
    // rect của các khối chính
    const box = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = R(el);
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    };
    return {
      n: leaves.length,
      hits,
      intro: box('.home-intro'),
      system: box('.home-system'),
      grid: box('.home-capability-grid'),
      scene: box('.home-scene'),
      stage: box('.stage--home'),
    };
  });

const rows = [];
for (const h of HEIGHTS) {
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2200);
    const d = await scan();
    const bad = d.hits.length;
    rows.push({ w, h, bad, top: d.hits[0] });
    if (bad > 0) {
      console.log(
        `  ${String(w).padStart(4)}x${String(h).padStart(3)}  OVERLAP=${String(bad).padStart(2)}  ` +
          `max ${d.hits[0].oy}px | "${d.hits[0].a}" X "${d.hits[0].b}"`,
      );
      console.log(
        `        intro=${JSON.stringify(d.intro)} system=${JSON.stringify(d.system)} grid=${JSON.stringify(d.grid)}`,
      );
    }
  }
}

console.log('\n=== ma tran overlap (w x h) ===');
console.log('        ' + HEIGHTS.map((h) => String(h).padStart(4)).join(''));
for (const w of WIDTHS) {
  const line = rows.filter((r) => r.w === w);
  console.log(
    String(w).padStart(6) + '  ' + line.map((r) => String(r.bad).padStart(4)).join(''),
  );
}

const worst = rows.filter((r) => r.bad > 0).sort((a, b) => b.bad - a.bad)[0];
console.log('\nworst:', worst ? JSON.stringify(worst) : 'không có overlap nào');

// Chụp ảnh các tỉ lệ đáng nghi
for (const [w, h, label] of [[1492, 751, 'user-real'], [1280, 800, 'vp1280x800'], [1150, 700, 'vp1150x700']]) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: OUT + 'scan-' + label + '.png' });
}

await browser.close();
