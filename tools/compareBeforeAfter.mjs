/**
 * So sánh chồng chữ: bản TRƯỚC bản vá vs bản SAU bản vá, trên mọi route.
 * Dùng 2 static server cục bộ (cổng 9321 = trước, 9322 = sau).
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const BEFORE = 'http://localhost:9321';
const AFTER = 'http://localhost:9322';

const ROUTES = ['/', '/about/', '/work/', '/skills/', '/credentials/', '/guestbook/', '/contact/'];
const VIEWPORTS = [[1536, 864], [1280, 800], [1920, 1080], [768, 1024]];

const servers = [
  spawn('java', ['-jar', 'build/libs/portfolio-kt.jar', '--port=9321', '--root=.tmp-before'], {
    stdio: 'ignore',
  }),
  spawn('java', ['-jar', 'build/libs/portfolio-kt.jar', '--port=9322', '--root=.tmp-after'], {
    stdio: 'ignore',
  }),
];
await new Promise((r) => setTimeout(r, 7000));

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

const count = () =>
  page.evaluate(() => {
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
    return hits;
  });

let regressions = 0;
for (const route of ROUTES) {
  console.log(`\n===== ${route} =====`);
  for (const [w, h] of VIEWPORTS) {
    const out = {};
    for (const [label, base] of [['before', BEFORE], ['after', AFTER]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(2500);
      out[label] = await count();
    }
    const delta = out.after - out.before;
    const flag = delta > 0 ? '  <<< HỒI QUY' : delta < 0 ? '  (tốt hơn)' : '';
    if (delta > 0) regressions++;
    console.log(`  ${String(w).padStart(4)}x${String(h).padStart(4)}  trước=${String(out.before).padStart(3)}  sau=${String(out.after).padStart(3)}  delta=${delta > 0 ? '+' : ''}${delta}${flag}`);
  }
}
console.log(`\n=> ${regressions} hồi quy`);

await browser.close();
for (const s of servers) s.kill();
