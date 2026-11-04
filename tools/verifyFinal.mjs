/**
 * Bản vá tối ưu: giữ font-size/padding gốc càng nhiều càng tốt,
 * chỉ sửa đúng nguyên nhân gốc (hàng 2 bị co về 0).
 *
 * Ý tưởng:
 *  1. `.home-scene` dùng `grid-template-rows: min-content minmax(min-content,1fr) min-content`
 *     => hàng 2 không bao giờ bị ép về 0 nữa.
 *  2. Nếu tổng vẫn cao hơn khung -> cho `.home-scene` cuộn dọc (overflow-y:auto)
 *     để không cắt mất nội dung.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/';
mkdirSync(OUT, { recursive: true });

const PATCH = `
  @media (min-width:1180px){
    .home-scene{grid-template-rows:min-content minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
    .home-scene::-webkit-scrollbar{display:none}
  }
  @media (min-width:1180px) and (max-height:900px){
    .stage.stage--home .home-title{padding-top:clamp(56px,7vh,88px)}
    .home-title h1{font-size:clamp(2.9rem,5.4vw,5.3rem)}
    .home-intro{padding-top:clamp(10px,1.4vh,18px)}
    .home-scene{gap:clamp(12px,1.6vw,20px)}
  }
  @media (max-width:1100px) and (min-width:721px){
    .home-scene{grid-template-rows:auto minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
    .home-scene::-webkit-scrollbar{display:none}
  }
  @media (max-height:760px) and (min-width:721px){
    .home-scene{grid-template-rows:auto minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
    .home-scene::-webkit-scrollbar{display:none}
  }`;

const VIEWPORTS = [
  [1536, 864], [1536, 800], [1536, 900], [1492, 751], [1280, 800], [1280, 720],
  [1366, 768], [1150, 700], [1100, 800], [1024, 700], [1024, 575], [1024, 600],
  [1600, 900], [1920, 1080], [1440, 900], [1280, 900], [900, 700], [800, 600],
  [768, 1024], [1024, 768], [1360, 768], [1600, 800], [1440, 810], [1180, 800],
];

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

const measure = () =>
  page.evaluate(() => {
    const scene = document.querySelector('.home-scene');
    const intro = document.querySelector('.home-intro');
    const system = document.querySelector('.home-system');
    const title = document.querySelector('.home-title');
    const a = intro.getBoundingClientRect(), b = system.getBoundingClientRect();
    const R = (el) => Math.round(el.getBoundingClientRect().height);
    return {
      overlap: Math.round(Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)),
      titleH: R(title), introH: R(intro), sysH: R(system),
      sceneTran: scene.scrollHeight - scene.clientHeight,
      overflowY: getComputedStyle(scene).overflowY,
      h1: getComputedStyle(title.querySelector('h1')).fontSize,
      p: getComputedStyle(intro.querySelector('p')).fontSize,
    };
  });

let bad = 0;
for (const [w, h] of VIEWPORTS) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  await page.addStyleTag({ content: PATCH });
  await page.waitForTimeout(800);
  const d = await measure();
  const flag = d.overlap > 0 ? '  <<< CHỒNG' : (d.sceneTran > 2 ? '  (cuộn được)' : '');
  if (d.overlap > 0) bad++;
  console.log(
    `  ${String(w).padStart(4)}x${String(h).padStart(4)}  overlap=${String(d.overlap).padStart(4)}  ` +
      `title.h=${String(d.titleH).padStart(3)} intro.h=${String(d.introH).padStart(3)} sys.h=${String(d.sysH).padStart(3)}  ` +
      `h1=${d.h1} p=${d.p}  tràn=${d.sceneTran}${flag}`,
  );
}
console.log(`\n=> ${bad}/${VIEWPORTS.length} viewport còn chồng intro/system`);

for (const [w, h] of [[1536, 864], [1280, 800], [1920, 1080], [1024, 575], [1366, 768]]) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: PATCH });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}final-${w}x${h}.png` });
}

await browser.close();
