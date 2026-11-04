import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 575 } });
await page.goto('http://localhost:9311/', { waitUntil: 'domcontentloaded' });

const rects = await page.evaluate(() => {
  const findEl = text => {
    return Array.from(document.querySelectorAll('*')).find(
      e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.includes(text))
    );
  };
  const pf = findEl('Production firmware');
  const fe = findEl('firmware engineer');
  const rPf = pf ? pf.getBoundingClientRect() : null;
  const rFe = fe ? fe.getBoundingClientRect() : null;
  return {
    pf: { rect: rPf, text: pf ? pf.textContent : null, parent: pf ? pf.parentElement.className : null },
    fe: { rect: rFe, text: fe ? fe.textContent : null, parent: fe ? fe.parentElement.className : null }
  };
});

console.log(JSON.stringify(rects, null, 2));
await browser.close();
