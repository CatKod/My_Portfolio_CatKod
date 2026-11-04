import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1492, height: 751 },
    deviceScaleFactor: 1.25,
  });
  const page = await context.newPage();
  await page.route('**/*', r => /translate\.google/.test(r.request().url()) ? r.abort() : r.continue());

  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const homeDetails = await page.evaluate(() => {
    const stage = document.querySelector('.stage--home') || document.body;
    // Get all interactive elements, cards, pills, text blocks
    const items = [];
    stage.querySelectorAll('*').forEach(el => {
      if (el.children.length === 0 && el.innerText && el.innerText.trim()) {
        const rect = el.getBoundingClientRect();
        items.push({
          tag: el.tagName,
          className: el.className,
          parentClass: el.parentElement ? el.parentElement.className : '',
          grandParentClass: el.parentElement && el.parentElement.parentElement ? el.parentElement.parentElement.className : '',
          text: el.innerText.trim(),
          rect: {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height
          }
        });
      }
    });

    const links = Array.from(document.querySelectorAll('a')).map(a => ({
      href: a.getAttribute('href'),
      text: a.innerText.trim()
    }));

    return { items: items.slice(0, 100), links };
  });

  console.log('Links on home page:', JSON.stringify(homeDetails.links, null, 2));
  console.log('Items sample on home page:', JSON.stringify(homeDetails.items.filter(x => x.text.length < 50), null, 2));

  // Let's also check /skills
  console.log('\n--- Checking https://catkod.github.io/skills ---');
  await page.goto('https://catkod.github.io/skills', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const skillsDetails = await page.evaluate(() => {
    const stage = document.querySelector('.stage') || document.body;
    const items = [];
    stage.querySelectorAll('*').forEach(el => {
      const cls = typeof el.className === 'string' ? el.className : '';
      if (/card|chip|pill|group|tag|badge|item|loop/i.test(cls)) {
        const rect = el.getBoundingClientRect();
        items.push({
          tag: el.tagName,
          className: cls,
          text: el.innerText ? el.innerText.slice(0, 60).replace(/\n/g, ' ') : '',
          rect: {
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          }
        });
      }
    });
    return {
      title: document.title,
      items: items.slice(0, 50)
    };
  });

  console.log('Skills page title:', skillsDetails.title);
  console.log('Skills elements:', JSON.stringify(skillsDetails.items, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
