/**
 * Xác định viewport CSS thật của người dùng bằng cách đối chiếu vị trí phần tử.
 *
 * Ảnh chụp của họ là 1024x575 (đúng tỉ lệ 16:9). Ta render trang chủ ở nhiều
 * viewport, đo rect các phần tử chủ lực, rồi tìm viewport mà tỉ lệ khớp với
 * ảnh (cùng cách scale cho cả X và Y).
 */
import { chromium } from 'playwright';

const USER = {
  // ước lượng từ ảnh: vùng chữ lớn "Hoàng Kim Vĩnh" và các thẻ capability
  // (sẽ được xác nhận bằng vòng lặp dưới)
};

const CANDIDATES = [];
for (const h of [575, 700, 751, 800, 900, 1080]) {
  for (const w of [1024, 1150, 1280, 1366, 1492, 1600, 1920]) {
    CANDIDATES.push([w, h]);
  }
}

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

const PROBE = () =>
  page.evaluate(() => {
    const R = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    };
    // element chua chu "Hoang Kim Vinh" trong hero
    const h1 = document.querySelector('.home-intro h1, .home-intro strong, .home-intro-name');
    const nameEl = h1
      ? { x: h1.getBoundingClientRect().x, y: h1.getBoundingClientRect().y,
          w: h1.getBoundingClientRect().width, h: h1.getBoundingClientRect().height }
      : null;
    // danh sach greeting
    const greetings = [...document.querySelectorAll('.home-intro *')]
      .filter((e) => e.children.length === 0 && e.textContent.trim().length > 0)
      .slice(0, 6)
      .map((e) => {
        const b = e.getBoundingClientRect();
        return { t: e.textContent.trim().slice(0, 20), x: b.x, y: b.y, w: b.width, h: b.height };
      });
    return {
      nameEl,
      greetings,
      intro: R('.home-intro'),
      system: R('.home-system'),
      grid: R('.home-capability-grid'),
      cards: [...document.querySelectorAll('.home-capability-card')].map((e) => {
        const b = e.getBoundingClientRect();
        return { x: b.x, y: b.y, w: b.width, h: b.height };
      }),
      stage: R('.stage--home'),
      frame: R('.portfolio-frame'),
    };
  });

for (const [w, h] of CANDIDATES) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  const d = await PROBE();
  // so voi anh: 1024x575. Do ti le theo chieu rong va chieu cao.
  const sx = 1024 / (d.frame?.w ? d.frame.x + d.frame.w : w);
  const sy = 575 / (d.frame?.h ? d.frame.y + d.frame.h : h);
  const consistent = Math.abs(sx - sy) / Math.max(sx, sy) < 0.03;
  console.log(
    `${String(w).padStart(4)}x${String(h).padStart(4)}  frame=${d.frame ? `${d.frame.x},${d.frame.y} ${d.frame.w}x${d.frame.h}` : '-'}  ` +
      `sx=${sx.toFixed(3)} sy=${sy.toFixed(3)} ${consistent ? '<== KHỚP TỈ LỆ ẢNH' : ''}`,
  );
  if (consistent) {
    console.log('   name:', JSON.stringify(d.nameEl));
    console.log('   cards:', JSON.stringify(d.cards.slice(0, 2)));
  }
}

await browser.close();
