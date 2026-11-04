import { chromium } from 'playwright';

const routes = ['/', '/about', '/work', '/skills', '/credentials', '/guestbook', '/contact'];
const base = 'http://localhost:9310';

const browser = await chromium.launch();
let bad = 0;
for (const r of routes) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  await page.goto(base + r, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const reactErr = errors.filter((e) => /418|423|425|Connection closed|hydrat/i.test(e));
  const other = errors.filter((e) => !/418|423|425|Connection closed|hydrat/i.test(e));
  const status = reactErr.length ? 'FAIL' : other.length ? 'WARN' : 'OK';
  if (reactErr.length) bad++;
  console.log(status, r, reactErr.length ? '| ' + reactErr.join(' ;; ') : '', other.length ? '| other: ' + other.join(' ;; ') : '');
  await ctx.close();
}
await browser.close();
console.log(bad === 0 ? 'ALL CLEAN' : bad + ' route(s) with React errors');
