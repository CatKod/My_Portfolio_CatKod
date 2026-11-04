import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1492, height: 751 },
    deviceScaleFactor: 1.25,
  });

  // Set cookie for google translate to Vietnamese
  await context.addCookies([
    {
      name: 'googtrans',
      value: '/en/vi',
      domain: 'catkod.github.io',
      path: '/'
    }
  ]);

  const page = await context.newPage();
  console.log('Navigating with Vietnamese translation enabled...');
  await page.goto('https://catkod.github.io/skills', { waitUntil: 'networkidle' });
  try {
    await page.waitForSelector('.initial-loader', { state: 'detached', timeout: 8000 });
  } catch {}
  await page.waitForTimeout(4000);

  const shotPath = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/skills_translated_vi.png';
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Saved translated screenshot to ' + shotPath);

  // Measure card and text heights
  const translatedData = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.skill-index-card')).map((card, i) => {
      const h2 = card.querySelector('h2');
      const p = card.querySelector('p');
      const tools = card.querySelector('.skill-index-tools');
      const h2Rect = h2?.getBoundingClientRect();
      const pRect = p?.getBoundingClientRect();
      const toolsRect = tools?.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      return {
        index: i,
        h2Text: h2?.innerText.trim(),
        pText: p?.innerText.trim(),
        cardHeight: cardRect.height,
        h2Bottom: h2Rect?.bottom,
        pTop: pRect?.top,
        pBottom: pRect?.bottom,
        toolsTop: toolsRect?.top,
        pOverlapTools: pRect && toolsRect ? (pRect.bottom - toolsRect.top) : null
      };
    });
    return cards;
  });

  console.log('Translated cards:', JSON.stringify(translatedData, null, 2));

  await browser.close();
}

run().catch(console.error);
