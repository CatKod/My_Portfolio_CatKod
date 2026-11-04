import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1536, height: 864 },
  deviceScaleFactor: 1
});

// Chặn Google Translate
await ctx.route('**/*', (r) => {
  const url = r.request().url();
  if (/translate\.google|translate\.googleapis/.test(url)) {
    return r.abort();
  }
  return r.continue();
});

const page = await ctx.newPage();
await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });

// Chờ .initial-loader có opacity=0
await page.waitForFunction(() => {
  const l = document.querySelector('.initial-loader');
  if (!l) return true;
  const s = getComputedStyle(l);
  return s.opacity === '0' || s.visibility === 'hidden' || s.display === 'none';
}, { timeout: 15000 }).catch(() => {});

// Thêm 2.5s
await page.waitForTimeout(2500);

const result = await page.evaluate(() => {
  const intro = document.querySelector('.home-intro');
  const system = document.querySelector('.home-system');
  
  let overlap = null;
  let introRect = null;
  let systemRect = null;
  if (intro && system) {
    const a = intro.getBoundingClientRect();
    const b = system.getBoundingClientRect();
    introRect = { top: a.top, bottom: a.bottom, left: a.left, right: a.right, height: a.height, width: a.width };
    systemRect = { top: b.top, bottom: b.bottom, left: b.left, right: b.right, height: b.height, width: b.width };
    overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  }

  const SKIP = '.initial-loader, .frame-footer';
  const leaves = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest(SKIP)) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (!own) continue;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    leaves.push({
      text: el.textContent.trim().slice(0, 40),
      tag: el.tagName.toLowerCase(),
      className: typeof el.className === 'string' ? el.className : '',
      r: { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height },
      el
    });
  }

  const collidingPairs = [];
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const A = leaves[i].el, B = leaves[j].el;
      if (A.contains(B) || B.contains(A)) continue;
      const a = leaves[i].r, b = leaves[j].r;
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 2 && oy > 2) {
        collidingPairs.push({
          a: { text: leaves[i].text, tag: leaves[i].tag, className: leaves[i].className, r: a },
          b: { text: leaves[j].text, tag: leaves[j].tag, className: leaves[j].className, r: b },
          ox: Math.round(ox * 100) / 100,
          oy: Math.round(oy * 100) / 100
        });
      }
    }
  }

  return {
    introRect,
    systemRect,
    overlap: Math.round(overlap * 100) / 100,
    pairCount: collidingPairs.length,
    collidingPairs
  };
});

const shotPath = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/gemini-final-1536x864.png';
await page.screenshot({ path: shotPath });
await browser.close();

console.log(JSON.stringify(result, null, 2));
