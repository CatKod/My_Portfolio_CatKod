import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.route('**/*', r => /translate\.google/.test(r.request().url()) ? r.abort() : r.continue());
await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });

const overlayInfo = await page.evaluate(() => {
  const elements = Array.from(document.querySelectorAll('*'));
  const hello = elements.find(e => e.children.length === 0 && e.textContent.includes('Hello'));
  const getChain = (el) => {
    const res = [];
    while (el && el !== document.body) {
      const s = getComputedStyle(el);
      res.push({
        tag: el.tagName,
        cls: el.className,
        id: el.id,
        position: s.position,
        zIndex: s.zIndex,
        opacity: s.opacity,
        visibility: s.visibility,
        display: s.display
      });
      el = el.parentElement;
    }
    return res;
  };
  return hello ? getChain(hello) : null;
});

console.log('Chain:', JSON.stringify(overlayInfo, null, 2));
await browser.close();
