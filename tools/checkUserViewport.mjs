/**
 * Xác định chính xác viewport CSS mà người dùng đang thấy.
 *
 * Ảnh chụp 1024x575 = màn 1920x1080 đã thu nhỏ (fullscreen, không có UI trình
 * duyệt). Với Windows scale 125%, viewport CSS = 1920/1.25 x 1080/1.25
 * = 1536 x 864.
 */
import { chromium } from 'playwright';

const CANDIDATES = [
  [1536, 864], // 1920x1080 / 1.25  <- giả thuyết chính
  [1492, 751], // vùng web đo được từ Cốc Cốc
  [1920, 1080],
  [1536, 800],
  [1536, 900],
];

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

for (const [w, h] of CANDIDATES) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const d = await page.evaluate(() => {
    const R = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { y: Math.round(b.y), h: Math.round(b.height), x: Math.round(b.x), w: Math.round(b.width) };
    };
    const scene = document.querySelector('.home-scene');
    const cs = getComputedStyle(scene);
    const intro = document.querySelector('.home-intro');
    const system = document.querySelector('.home-system');
    const a = intro.getBoundingClientRect(), b = system.getBoundingClientRect();
    return {
      rows: cs.gridTemplateRows,
      cols: cs.gridTemplateColumns,
      title: R('.home-title'),
      intro: R('.home-intro'),
      system: R('.home-system'),
      overlap: Math.round(Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)),
      cardsPerRow: getComputedStyle(document.querySelector('.home-capability-grid')).gridTemplateColumns.split(' ').length,
      sceneScroll: scene.scrollHeight + '/' + scene.clientHeight,
    };
  });

  console.log(`\n--- ${w}x${h} ---`);
  console.log(`  rows: ${d.rows}`);
  console.log(`  cols: ${d.cols}   (số cột thẻ: ${d.cardsPerRow})`);
  console.log(`  title : ${JSON.stringify(d.title)}`);
  console.log(`  intro : ${JSON.stringify(d.intro)}`);
  console.log(`  system: ${JSON.stringify(d.system)}`);
  console.log(`  CHỒNG = ${d.overlap}px   scene scroll/client = ${d.sceneScroll}`);
}

await browser.close();
