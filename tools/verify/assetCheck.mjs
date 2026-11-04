/**
 * Kiểm tra mọi tài nguyên mà các trang yêu cầu có trả 200 trên bản deploy.
 *
 * Bản deploy được phục vụ bởi `ghPagesServer.mjs` để mô phỏng đúng cách
 * GitHub Pages phục vụ (route -> thư mục/index.html, MIME theo đuôi).
 */
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:9314';
const routes = ['/', '/about', '/work', '/skills', '/credentials', '/guestbook', '/contact'];

const browser = await chromium.launch({ channel: 'chrome' });
let totalBad = 0;

for (const r of routes) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const bad = new Set();
  page.on('response', (res) => {
    if (res.status() >= 400) bad.add(res.status() + ' ' + res.url());
  });

  await page.goto(base + r, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Điều hướng client-side tới từng route để nạp thêm chunk của route đó.
  for (const target of routes) {
    await page.evaluate((t) => {
      const a = document.querySelector('a[href="' + t + '"]');
      if (a) a.click();
    }, target);
    await page.waitForTimeout(2500);
  }

  const brokenImgs = await page.evaluate(() =>
    [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
  );

  const list = [...bad];
  totalBad += list.length;
  console.log((list.length ? 'FAIL ' : 'OK   ') + r.padEnd(13), 'bad=' + list.length, 'brokenImg=' + brokenImgs.length);
  for (const b of list) console.log('   ' + b);
  if (brokenImgs.length) {
    const uniq = [...new Set(brokenImgs)];
    console.log('   broken images: ' + uniq.length + ' unique');
    for (const u of uniq.slice(0, 5)) console.log('     ' + u);
  }
  await ctx.close();
}
await browser.close();
console.log(totalBad === 0 ? '\nALL RESOURCES OK' : '\n' + totalBad + ' bad responses');
