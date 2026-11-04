import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1492, height: 751 },
    deviceScaleFactor: 1.25,
  });
  const page = await context.newPage();
  await page.route('**/*', r => /translate\.google/.test(r.request().url()) ? r.abort() : r.continue());

  console.log('Navigating to https://catkod.github.io/ ...');
  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const domInfo = await page.evaluate(() => {
    // Search all classes or elements matching skill or chip
    const all = Array.from(document.querySelectorAll('*'));
    const skillElements = [];
    for (const el of all) {
      const cls = typeof el.className === 'string' ? el.className : '';
      if (/skill|chip|pill|badge|tag/i.test(cls) || /skill|chip/i.test(el.id)) {
        skillElements.push({
          tag: el.tagName.toLowerCase(),
          id: el.id,
          className: cls,
          text: el.innerText ? el.innerText.slice(0, 100) : '',
          childrenCount: el.children.length,
          rect: el.getBoundingClientRect()
        });
      }
    }
    // Also check sections or headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
      tag: h.tagName,
      text: h.innerText.trim(),
      rect: h.getBoundingClientRect()
    }));

    return {
      title: document.title,
      headings,
      skillElementsCount: skillElements.length,
      sampleSkills: skillElements.slice(0, 30)
    };
  });

  console.log('Page Title:', domInfo.title);
  console.log('Headings:', JSON.stringify(domInfo.headings, null, 2));
  console.log('Found skill elements:', domInfo.skillElementsCount);
  console.log('Sample elements:', JSON.stringify(domInfo.sampleSkills, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
