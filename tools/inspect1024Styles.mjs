import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 575 } });
await page.goto('http://localhost:9311/', { waitUntil: 'domcontentloaded' });

const styles = await page.evaluate(() => {
  const g = document.querySelector('.home-capability-grid');
  const c = document.querySelector('.home-capability-card');
  const h = document.querySelector('.home-system-head');
  const sg = getComputedStyle(g);
  const sc = getComputedStyle(c);
  const sh = getComputedStyle(h);
  return {
    grid: { cols: sg.gridTemplateColumns, rows: sg.gridTemplateRows, height: sg.height },
    card: { minHeight: sc.minHeight, height: sc.height, padding: sc.padding },
    head: { height: sh.height, padding: sh.padding, gap: sh.gap }
  };
});

console.log(JSON.stringify(styles, null, 2));
await browser.close();
