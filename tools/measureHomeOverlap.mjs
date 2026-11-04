import { chromium } from 'playwright';

const URL = process.argv[2] || 'https://catkod.github.io/';

// Standard sweep matrix
const WIDTHS = [1024, 1100, 1150, 1200, 1250, 1280, 1300, 1350, 1366, 1400, 1440, 1450, 1492, 1550, 1600, 1700, 1920];
const HEIGHTS = [575, 700, 751, 768, 800, 900, 1080];

const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', r =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue()
);
const page = await ctx.newPage();

// Bypass intro loader once
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('.initial-loader', { state: 'detached', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(500);

const scan = () =>
  page.evaluate(() => {
    const R = el => el.getBoundingClientRect();
    const leaves = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('.initial-loader')) continue;
      const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
      if (!own) continue;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) continue;
      const r = R(el);
      if (r.width < 2 || r.height < 2) continue;
      leaves.push({ el, r, text: el.textContent.trim().slice(0, 32) });
    }
    const hits = [];
    for (let i = 0; i < leaves.length; i++) {
      for (let j = i + 1; j < leaves.length; j++) {
        const A = leaves[i].el, B = leaves[j].el;
        if (A.contains(B) || B.contains(A)) continue;
        const a = leaves[i].r, b = leaves[j].r;
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ox > 2 && oy > 2) {
          hits.push({ a: leaves[i].text, b: leaves[j].text, ox: +ox.toFixed(0), oy: +oy.toFixed(0) });
        }
      }
    }
    hits.sort((x, y) => y.oy - x.oy);
    const box = sel => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = R(el);
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    };
    return {
      n: leaves.length,
      hits,
      intro: box('.home-intro'),
      system: box('.home-system'),
      grid: box('.home-capability-grid'),
      scene: box('.home-scene')
    };
  });

console.log(`=== SCANNING URL: ${URL} ===\n`);
const rows = [];
for (const h of HEIGHTS) {
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('.initial-loader', { state: 'detached', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(600);
    const d = await scan();
    const bad = d.hits.length;
    rows.push({ w, h, bad, top: d.hits[0], intro: d.intro, system: d.system });
    if (bad > 0) {
      console.log(
        `  ${String(w).padStart(4)}x${String(h).padStart(4)}  OVERLAP=${String(bad).padStart(2)}  ` +
        `max ${String(d.hits[0].oy).padStart(3)}px | "${d.hits[0].a}" X "${d.hits[0].b}"`
      );
    }
  }
}

console.log('\n=== OVERLAP MATRIX (rows: Width, cols: Height) ===');
console.log('       ' + HEIGHTS.map(h => String(h).padStart(6)).join(''));
for (const w of WIDTHS) {
  const line = rows.filter(r => r.w === w);
  console.log(
    String(w).padStart(6) + ' ' + line.map(r => String(r.bad).padStart(6)).join('')
  );
}

await browser.close();
