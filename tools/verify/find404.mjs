/**
 * Tìm request nào trả 404 trên từng route.
 */
import { chromium } from 'playwright';

const URL = process.argv[2] || 'https://catkod.github.io';
const ROUTES = ['/', '/about/', '/credentials/'];

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
const page = await ctx.newPage();

for (const route of ROUTES) {
  const bad = [];
  page.on('response', (r) => {
    if (r.status() >= 400) bad.push(r.status() + '  ' + r.url());
  });
  await page.setViewportSize({ width: 1536, height: 864 });
  await page.goto(URL + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  console.log(`\n${route}  -> ${bad.length} request lỗi`);
  for (const b of [...new Set(bad)]) console.log('   ' + b);
}

await browser.close();
