/**
 * Kiểm tra lỗi console/hydration trên static server (không có endpoint RSC).
 */
import { chromium } from 'playwright';

const routes = ['/', '/about', '/work', '/skills', '/credentials', '/guestbook', '/contact'];
const base = process.argv[2] || 'http://localhost:9311';

const browser = await chromium.launch({ channel: 'chrome' });
let bad = 0;

for (const r of routes) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto(base + r, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const react = errors.filter((e) => /418|423|425|Connection closed|hydrat|Minified React/i.test(e));
  const other = errors.filter((e) => !/418|423|425|Connection closed|hydrat|Minified React/i.test(e));
  const title = await page.title();
  const h1 = await page.evaluate(() => {
    const el = document.querySelector('h1, h2');
    return el ? el.textContent.trim().slice(0, 40) : '(none)';
  });

  if (react.length) bad++;
  console.log((react.length ? 'FAIL ' : 'OK   ') + r.padEnd(13), '| title=' + title.slice(0, 40), '| ' + h1);
  if (react.length) console.log('   react: ' + react.join(' | ').slice(0, 300));
  const noise = other.filter((e) => !/Failed to load resource/.test(e));
  if (noise.length) console.log('   other: ' + noise.join(' | ').slice(0, 200));
  console.log('   404s: ' + other.filter((e) => /404/.test(e)).length);

  await ctx.close();
}
await browser.close();
console.log(bad === 0 ? '\nNO HYDRATION ERRORS' : '\n' + bad + ' route(s) co loi hydration');
