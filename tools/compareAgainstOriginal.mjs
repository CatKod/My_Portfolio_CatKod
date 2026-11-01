/**
 * Kiểm tra chồng chữ ở các trang KHÁC trang chủ: do bản vá .home-scene gây ra
 * hay là lỗi có sẵn từ trước?
 *
 * Cách kiểm tra: so sánh số cặp chồng giữa
 *   (a) bản CSS đang deploy (đã vá .home-scene)
 *   (b) bản CSS GỐC (không vá) — lấy từ git history của repo nguồn
 * Nếu (a) == (b) thì lỗi không liên quan tới bản vá.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';

const URL = process.argv[2] || 'https://catkod.github.io';
const ROUTES = ['/about/', '/work/', '/skills/', '/credentials/', '/guestbook/', '/contact/'];
const VIEWPORTS = [[1536, 864], [1280, 800], [1920, 1080], [768, 1024]];

// CSS gốc (trước khi vá) lấy từ commit trước
const ORIG_CSS = 'site.orig.bak/_next/static/chunks/0kv4a-p~1zj9b.css';
const origCss = readFileSync(ORIG_CSS, 'utf8');
writeFileSync('D:/GitHub/My_Portfolio_CatKod/shots/gemini/orig.css', origCss);
console.log('CSS gốc: ' + origCss.length + ' bytes');

// trích các rule liên quan .home-* từ CSS gốc để override
const origHome = [];
const re = /([^{}]*\.home-[^{}]*)\{([^{}]*)\}/g;
let m;
while ((m = re.exec(origCss))) origHome.push(m[1].trim() + '{' + m[2] + '}');
console.log('rule .home-* trong CSS gốc: ' + origHome.length);

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
    return { hits, hasHomeScene: !!document.querySelector('.home-scene') };
  });

for (const route of ROUTES) {
  console.log(`\n===== ${route} =====`);
  for (const [w, h] of VIEWPORTS) {
    const results = {};
    for (const mode of ['deployed', 'original-css']) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(URL + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(2500);
      if (mode === 'original-css') {
        // override bằng CSS gốc cho các rule .home-*
        await page.addStyleTag({ content: origHome.join('\n') });
        await page.waitForTimeout(700);
      }
      results[mode] = await count();
    }
    const same = results.deployed.hits === results['original-css'].hits;
    console.log(
      `  ${String(w).padStart(4)}x${String(h).padStart(4)}  deployed=${results.deployed.hits}  ` +
        `gốc=${results['original-css'].hits}  ${same ? '=> GIỐNG NHAU (lỗi có sẵn)' : '=> KHÁC NHAU'}  ` +
        `.home-scene=${results.deployed.hasHomeScene}`,
    );
  }
}

await browser.close();
