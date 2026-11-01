/**
 * Đo chi tiết các hàng của .home-scene để thiết kế bản vá.
 *
 * Vấn đề: .home-scene có grid-template-rows: min-content minmax(0,1fr) min-content
 * .home-intro ở grid-area 2/1, .home-system ở grid-area 3/1/auto/-1
 * Khi track hàng 2 bị co về 0, .home-intro (align-self:start) tràn chồng lên hàng 3.
 */
import { chromium } from 'playwright';

const VIEWPORTS = [
  [1024, 575], [1024, 700], [1150, 700], [1280, 800], [1366, 768],
  [1492, 751], [1492, 800], [1600, 900], [1920, 1080], [1280, 900],
];

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

for (const [w, h] of VIEWPORTS) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const d = await page.evaluate(() => {
    const scene = document.querySelector('.home-scene');
    if (!scene) return { err: 'no scene' };
    const cs = getComputedStyle(scene);
    const R = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { y: Math.round(b.y), h: Math.round(b.height), x: Math.round(b.x), w: Math.round(b.width) };
    };
    const sb = scene.getBoundingClientRect();
    return {
      rows: cs.gridTemplateRows,
      cols: cs.gridTemplateColumns,
      scene: { y: Math.round(sb.y), h: Math.round(sb.height), w: Math.round(sb.width) },
      scrollH: scene.scrollHeight,
      clientH: scene.clientHeight,
      title: R('.home-title'),
      intro: R('.home-intro'),
      system: R('.home-system'),
      signal: R('.home-signal'),
      introOverflow: (() => {
        const i = document.querySelector('.home-intro');
        const s = document.querySelector('.home-system');
        if (!i || !s) return null;
        const a = i.getBoundingClientRect(), b = s.getBoundingClientRect();
        return Math.round(Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      })(),
    };
  });

  if (d.err) { console.log(`${w}x${h}  ${d.err}`); continue; }
  console.log(`\n--- ${w}x${h} ---`);
  console.log(`  rows: ${d.rows}`);
  console.log(`  cols: ${d.cols}`);
  console.log(`  scene: y=${d.scene.y} h=${d.scene.h}  scrollH=${d.scrollH} clientH=${d.clientH} ${d.scrollH > d.clientH ? '<< TRÀN' : ''}`);
  console.log(`  title : ${JSON.stringify(d.title)}`);
  console.log(`  intro : ${JSON.stringify(d.intro)}`);
  console.log(`  system: ${JSON.stringify(d.system)}`);
  if (d.signal) console.log(`  signal: ${JSON.stringify(d.signal)}`);
  console.log(`  intro∩system = ${d.introOverflow}px`);
}

await browser.close();
