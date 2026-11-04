import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.route('**/*', r => /translate\.google/.test(r.request().url()) ? r.abort() : r.continue());
await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });

const pt = await page.evaluate(() => {
  const el = document.elementFromPoint(640, 400);
  if (!el) return null;
  return {
    tag: el.tagName,
    cls: el.className,
    text: el.textContent,
    outer: el.outerHTML.slice(0, 300)
  };
});
console.log('Point 640,400:', pt);
await browser.close();
