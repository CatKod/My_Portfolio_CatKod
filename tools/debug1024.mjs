import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 575 } });
await page.goto('http://localhost:9311/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1000);

const boxes = await page.evaluate(() => {
  const getB = sel => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      rect: { y: Math.round(r.y), h: Math.round(r.height), bottom: Math.round(r.bottom) },
      paddingTop: s.paddingTop,
      paddingBottom: s.paddingBottom,
      marginTop: s.marginTop,
      marginBottom: s.marginBottom
    };
  };
  return {
    stage: getB('.stage'),
    footer: getB('.frame-footer'),
    title: getB('.home-title'),
    titleH1: getB('.home-title h1'),
    intro: getB('.home-intro'),
    system: getB('.home-system'),
    grid: getB('.home-capability-grid')
  };
});

console.log(JSON.stringify(boxes, null, 2));
await browser.close();
