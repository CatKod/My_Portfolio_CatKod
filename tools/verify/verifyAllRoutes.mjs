/**
 * Kiểm tra KHÔNG phá vỡ các trang khác sau khi vá .home-scene.
 * So sánh pixel với bản live cũ (trước vá) là không khả thi, nên ta đo
 * overlap + lỗi console trên mọi route.
 */
import { chromium } from 'playwright';

const URL = process.argv[2] || 'https://catkod.github.io';
const ROUTES = ['/', '/about/', '/work/', '/skills/', '/credentials/', '/guestbook/', '/contact/'];
const VIEWPORTS = [[1536, 864], [1280, 800], [1920, 1080], [768, 1024]];

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

let total = 0;
for (const route of ROUTES) {
  console.log(`\n===== ${route} =====`);
  for (const [w, h] of VIEWPORTS) {
    const errors = [];
    const failed = [];
    const onErr = (e) => errors.push(e.message.slice(0, 80));
    const onFail = (r) => failed.push(r.status() + ' ' + r.url().split('/').pop().slice(0, 40));
    page.on('pageerror', onErr);
    page.on('response', onFail);

    await page.setViewportSize({ width: w, height: h });
    await page.goto(URL + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForFunction(
      () => {
        const l = document.querySelector('.initial-loader');
        if (!l) return true;
        const s = getComputedStyle(l);
        return s.opacity === '0' || s.visibility === 'hidden' || s.display === 'none';
      },
      { timeout: 15000 },
    ).catch(() => {});
    await page.waitForTimeout(2000);

    const d = await page.evaluate(() => {
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
      const doc = document.documentElement;
      return {
        hits,
        scrollX: doc.scrollWidth - window.innerWidth,
        textCount: leaves.length,
        hasContent: leaves.length > 3,
      };
    });

    page.off('pageerror', onErr);
    page.off('response', onFail);

    const flag = d.hits > 0 || d.scrollX > 2 ? '  <<< VẤN ĐỀ' : '';
    if (flag) total++;
    console.log(
      `  ${String(w).padStart(4)}x${String(h).padStart(4)}  chồng=${d.hits}  tràn ngang=${d.scrollX}  ` +
        `text elements=${d.textCount}${flag}` +
        (errors.length ? `  JS-err=${errors.length}` : '') +
        (failed.length ? `  HTTP-err=${failed.length}` : ''),
    );
    if (errors.length) console.log('    ' + errors.slice(0, 2).join(' | '));
    if (failed.length) console.log('    ' + failed.slice(0, 3).join(' | '));
  }
}
console.log(`\n=> ${total} vấn đề`);

await browser.close();
