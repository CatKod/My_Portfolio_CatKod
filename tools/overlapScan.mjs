/**
 * Dò CHỒNG CHỮ toàn cục ở đúng tỉ lệ màn hình của người dùng.
 *
 * Không đoán selector: dò mọi cặp element text có rect giao nhau trên trục y.
 *
 * Người dùng: 3 màn 1920x1080, scale 125%. Cốc Cốc maximized, vùng render web
 * 1865x939 px vật lý => viewport CSS thật = 1492 x 751.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/';
mkdirSync(OUT, { recursive: true });

const URL = process.argv[2] || 'https://catkod.github.io/';
const VIEWPORTS = [
  [1492, 751, 'user-real'],
  [1280, 800, 'vp1280x800'],
  [1920, 1080, 'vp1920x1080'],
];

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

for (const [w, h, label] of VIEWPORTS) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const data = await page.evaluate(() => {
    const R = (el) => {
      const b = el.getBoundingClientRect();
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    };
    const path = (el) => {
      const bits = [];
      let n = el;
      while (n && n !== document.body && bits.length < 4) {
        const cn = (typeof n.className === 'string' ? n.className : '').split(/\s+/).filter(Boolean)[0];
        bits.push(n.tagName.toLowerCase() + (cn ? '.' + cn : ''));
        n = n.parentElement;
      }
      return bits.reverse().join(' > ');
    };

    // Chỉ xét element có text trực tiếp (leaf text node)
    const leaves = [];
    for (const el of document.querySelectorAll('body *')) {
      const hasOwnText = [...el.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim().length > 0,
      );
      if (!hasOwnText) continue;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') continue;
      const r = R(el);
      if (r.w < 2 || r.h < 2) continue;
      leaves.push({ el, r, text: el.textContent.trim().slice(0, 40), path: path(el) });
    }

    const overlaps = [];
    for (let i = 0; i < leaves.length; i++) {
      for (let j = i + 1; j < leaves.length; j++) {
        // bỏ qua quan hệ cha-con (không phải chồng lấn thật)
        const A = leaves[i].el, B = leaves[j].el;
        if (A.contains(B) || B.contains(A)) continue;
        const a = leaves[i].r, b = leaves[j].r;
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (ox > 2 && oy > 2) {
          overlaps.push({
            a: leaves[i].text, b: leaves[j].text,
            aPath: leaves[i].path, bPath: leaves[j].path,
            ox: +ox.toFixed(1), oy: +oy.toFixed(1),
            aRect: { x: +a.x.toFixed(0), y: +a.y.toFixed(0), w: +a.w.toFixed(0), h: +a.h.toFixed(0) },
            bRect: { x: +b.x.toFixed(0), y: +b.y.toFixed(0), w: +b.w.toFixed(0), h: +b.h.toFixed(0) },
          });
        }
      }
    }
    overlaps.sort((x, y) => y.oy * y.ox - x.oy * x.ox);

    // Thông tin layout tổng thể
    const sections = [...document.querySelectorAll('section, main > *')].slice(0, 20).map((el) => {
      const r = R(el);
      const cn = (typeof el.className === 'string' ? el.className : '').split(/\s+/).filter(Boolean).slice(0, 2).join('.');
      return { tag: el.tagName.toLowerCase(), cls: cn, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) };
    });

    return {
      leafCount: leaves.length,
      overlapCount: overlaps.length,
      overlaps: overlaps.slice(0, 12),
      sections,
      innerW: window.innerWidth,
      innerH: window.innerHeight,
      scrollW: document.documentElement.scrollWidth,
      bodyH: document.body.scrollHeight,
    };
  });

  console.log(`\n===== ${label} (${w}x${h}) =====`);
  console.log(`text elements: ${data.leafCount} | CHỒNG CHỮ: ${data.overlapCount} | innerH=${data.innerH} scrollW=${data.scrollW} bodyH=${data.bodyH}`);
  for (const o of data.overlaps.slice(0, 8)) {
    console.log(`  OVERLAP ${o.oy}px y / ${o.ox}px x`);
    console.log(`     A "${o.a}" @${JSON.stringify(o.aRect)}\n       ${o.aPath}`);
    console.log(`     B "${o.b}" @${JSON.stringify(o.bRect)}\n       ${o.bPath}`);
  }
  console.log('  sections:');
  for (const s of data.sections) console.log(`     ${s.tag}.${s.cls}  x=${s.x} y=${s.y} ${s.w}x${s.h}`);

  await page.screenshot({ path: OUT + 'overlap-' + label + '.png', fullPage: true });
}

await browser.close();
