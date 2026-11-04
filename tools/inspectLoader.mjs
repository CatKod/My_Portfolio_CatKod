import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://catkod.github.io/', { waitUntil: 'domcontentloaded' });
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(500);
  const data = await page.evaluate((step) => {
    const all = Array.from(document.querySelectorAll('*'));
    const merhabaEl = all.find(el => el.textContent && el.textContent.includes('Merhaba'));
    const htmlCls = document.documentElement.className;
    const bodyCls = document.body.className;
    return {
      step,
      merhaba: merhabaEl ? { tag: merhabaEl.tagName, cls: merhabaEl.className, text: merhabaEl.textContent.trim() } : null,
      htmlCls,
      bodyCls,
      stage: !!document.querySelector('.stage--home')
    };
  }, i);
  console.log(i * 500 + 'ms', data);
  if (!data.merhaba) break;
}
await browser.close();
