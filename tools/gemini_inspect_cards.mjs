import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1492, height: 751 },
    deviceScaleFactor: 1.25,
  });
  await page.route('**/*', r => /translate\.google/.test(r.request().url()) ? r.abort() : r.continue());

  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const homeCards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.home-capability-card, [class*="card"], [class*="skill"], [class*="chip"]')).map(el => ({
      class: el.className,
      html: el.innerHTML.slice(0, 200),
      text: el.innerText.trim()
    }));
  });
  console.log('Home cards / chips count:', homeCards.length);
  console.log('Home cards:', JSON.stringify(homeCards, null, 2));

  // Let's also inspect /skills
  await page.goto('https://catkod.github.io/skills', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const skillsStructure = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.skill-index-card, .skill-tool-group, [class*="skill"], [class*="chip"], [class*="pill"]')).map(el => ({
      tag: el.tagName,
      class: el.className,
      text: el.innerText.trim().slice(0, 100),
      childrenClasses: Array.from(el.children).map(c => c.className)
    }));
    return cards;
  });
  console.log('Skills page elements count:', skillsStructure.length);
  console.log('Skills page sample elements:', JSON.stringify(skillsStructure.slice(0, 20), null, 2));

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
