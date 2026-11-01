/**
 * Kiểm chứng bản build CỤC BỘ (http://localhost:9310) với bản vá mới.
 * Chạy server trước: java -jar build/libs/portfolio-kt.jar --port=9310 --root=site
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/';
mkdirSync(OUT, { recursive: true });

const URL = process.argv[2] || 'http://localhost:9310/';

const VIEWPORTS = [
  [1536, 864], [1536, 800], [1536, 900], [1492, 751], [1280, 800], [1280, 720],
  [1366, 768], [1150, 700], [1100, 800], [1024, 700], [1024, 575], [1024, 600],
  [1600, 900], [1920, 1080], [1440, 900], [1280, 900], [900, 700], [800, 600],
  [768, 1024], [1024, 768], [1360, 768], [1600, 800], [1440, 810], [1180, 800],
  [1181, 800], [1216, 682], [1512, 982], [1728, 1117], [1024, 900], [1440, 700],
];

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

const check = () =>
  page.evaluate(() => {
    const intro = document.querySelector('.home-intro');
    const system = document.querySelector('.home-system');
    const scene = document.querySelector('.home-scene');
    if (!intro || !system) return { err: 'khong co element' };
    const a = intro.getBoundingClientRect(), b = system.getBoundingClientRect();
    const SKIP = '.initial-loader, .frame-footer';
    const leaves = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest(SKIP)) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
      if (!own) continue;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      leaves.push({ el, r });
    }
    let hits = 0;
    for (let i = 0; i < leaves.length; i++) {
      for (let j = i + 1; j < leaves.length; j++) {
        const A = leaves[i].el, B = leaves[j].el;
        if (A.contains(B) || B.contains(A)) continue;
        const x = leaves[i].r, y = leaves[j].r;
        const ox = Math.min(x.right, y.right) - Math.max(x.left, y.left);
        const oy = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top);
        if (ox > 2 && oy > 2) hits++;
      }
    }
    return {
      overlap: Math.round(Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)),
      hits,
      sceneTran: scene.scrollHeight - scene.clientHeight,
      rows: getComputedStyle(scene).gridTemplateRows,
      h1: getComputedStyle(document.querySelector('.home-title h1')).fontSize,
    };
  });

let bad = 0;
for (const [w, h] of VIEWPORTS) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForFunction(
    () => {
      const l = document.querySelector('.initial-loader');
      if (!l) return true;
      const s = getComputedStyle(l);
      return s.opacity === '0' || s.visibility === 'hidden' || s.display === 'none';
    },
    { timeout: 15000 },
  ).catch(() => {});
  await page.waitForTimeout(2200);
  const d = await check();
  if (d.err) { console.log(`  ${w}x${h}  ${d.err}`); bad++; continue; }
  const flag = d.overlap > 0 || d.hits > 0 ? '  <<< LỖI' : '';
  if (flag) bad++;
  console.log(
    `  ${String(w).padStart(4)}x${String(h).padStart(4)}  overlap=${String(d.overlap).padStart(4)}  hits=${d.hits}  ` +
      `h1=${d.h1.padStart(8)}  rows=${d.rows.padEnd(28)}  tràn=${String(d.sceneTran).padStart(3)}${flag}`,
  );
}
console.log(`\n=> ${bad}/${VIEWPORTS.length} còn lỗi  (${URL})`);

for (const [w, h] of [[1536, 864], [1280, 800], [1920, 1080], [1024, 575]]) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForFunction(
    () => {
      const l = document.querySelector('.initial-loader');
      if (!l) return true;
      const s = getComputedStyle(l);
      return s.opacity === '0' || s.visibility === 'hidden' || s.display === 'none';
    },
    { timeout: 15000 },
  ).catch(() => {});
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}local-${w}x${h}.png` });
}

await browser.close();
