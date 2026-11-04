import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.route('**/*', r => /translate\.google/.test(r.request().url()) ? r.abort() : r.continue());
await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });

const parentInfo = await page.evaluate(() => {
  const el = document.querySelector('.loader-wordmark');
  let cur = el;
  const path = [];
  while (cur && cur !== document.body) {
    path.push({ tag: cur.tagName, cls: cur.className, style: cur.getAttribute('style') });
    cur = cur.parentElement;
  }
  return path;
});
console.log('Loader parent chain:', parentInfo);

// How long does the loader stay?
console.log('Waiting for loader to disappear...');
const start = Date.now();
while (Date.now() - start < 15000) {
  const exists = await page.evaluate(() => !!document.querySelector('.loader-wordmark'));
  if (!exists) {
    console.log(`Loader gone after ${Date.now() - start}ms!`);
    break;
  }
  await page.waitForTimeout(300);
}

await browser.close();
