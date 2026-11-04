/**
 * Kiểm tra lại delta +1 ở /skills/ 1280x800: là thật hay do animation/loader?
 * Chạy 3 lần mỗi bản và so sánh.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const BEFORE = 'http://localhost:9321';
const AFTER = 'http://localhost:9322';

const servers = [
  spawn('java', ['-jar', 'build/libs/portfolio-kt.jar', '--port=9321', '--root=.tmp-before'], { stdio: 'ignore' }),
  spawn('java', ['-jar', 'build/libs/portfolio-kt.jar', '--port=9322', '--root=.tmp-after'], { stdio: 'ignore' }),
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
      leaves.push({ el, r, text: el.textContent.trim().slice(0, 25) });
    }
    const out = [];
    for (let i = 0; i < leaves.length; i++) {
      for (let j = i + 1; j < leaves.length; j++) {
        const A = leaves[i].el, B = leaves[j].el;
        if (A.contains(B) || B.contains(A)) continue;
        const x = leaves[i].r, y = leaves[j].r;
        const ox = Math.min(x.right, y.right) - Math.max(x.left, y.left);
        const oy = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top);
        if (ox > 2 && oy > 2) {
          out.push({ a: leaves[i].text, b: leaves[j].text, ox: Math.round(ox), oy: Math.round(oy) });
        }
      }
    }
    out.sort((p, q) => q.oy - p.oy);
    return out;
  });

for (const [label, base] of [['TRUOC', BEFORE], ['SAU  ', AFTER]]) {
  console.log(`\n########## ${label} (1280x800 /skills/) ##########`);
  for (let run = 1; run <= 3; run++) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(base + '/skills/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);
    const hits = await count();
    console.log(`  run ${run}: ${hits.length} cặp chồng`);
    for (const h of hits.slice(0, 6)) console.log(`     oy=${h.oy} ox=${h.ox}  "${h.a}" X "${h.b}"`);
  }
}

await browser.close();
for (const s of servers) s.kill();
