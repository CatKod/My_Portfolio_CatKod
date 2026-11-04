import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1492, height: 751 }, deviceScaleFactor: 1.25 });
  // Allow Google Translate
  await page.goto('https://catkod.github.io/skills', { waitUntil: 'networkidle' });
  try {
    await page.waitForSelector('.initial-loader', { state: 'detached', timeout: 8000 });
  } catch {}
  await page.waitForTimeout(2000);

  const translateInfo = await page.evaluate(() => {
    return {
      hasTranslateScript: !!document.querySelector('script[src*="translate"]'),
      elements: Array.from(document.querySelectorAll('*[class*="goog"], *[id*="goog"], *[class*="translate"]')).map(e => ({
        tag: e.tagName,
        className: e.className,
        id: e.id
      }))
    };
  });
  console.log('Translate info:', JSON.stringify(translateInfo, null, 2));
  await browser.close();
}

run().catch(console.error);
