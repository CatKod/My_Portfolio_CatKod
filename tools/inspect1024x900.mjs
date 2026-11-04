import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
await page.goto('http://localhost:9311/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1000);

const data = await page.evaluate(() => {
  const s = document.querySelector('.stage');
  const f = document.querySelector('.frame-footer');
  const sys = document.querySelector('.home-system');
  const grid = document.querySelector('.home-capability-grid');
  return {
    stage: s.getBoundingClientRect(),
    footer: f.getBoundingClientRect(),
    system: sys.getBoundingClientRect(),
    grid: grid.getBoundingClientRect(),
    systemDisplay: getComputedStyle(sys).display,
    systemGridCols: getComputedStyle(sys).gridTemplateColumns
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
