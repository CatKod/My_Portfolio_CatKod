/**
 * Đo chồng chữ sau khi loader đã fade xong hẳn (loader đè lên nền nên gây
 * false positive nếu đo sớm).
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/';
mkdirSync(OUT, { recursive: true });

const PATCH = `
  @media (min-width:1180px){
    .home-scene{grid-template-rows:min-content minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
    .home-scene::-webkit-scrollbar{display:none}
  }
  @media (min-width:1180px) and (max-height:900px){
    .stage.stage--home .home-title{padding-top:clamp(56px,7vh,88px)}
    .home-title h1{font-size:clamp(2.9rem,5.4vw,5.3rem)}
    .home-intro{padding-top:clamp(10px,1.4vh,18px)}
    .home-scene{gap:clamp(12px,1.6vw,20px)}
  }
  @media (max-width:1100px) and (min-width:721px){
    .home-scene{grid-template-rows:auto minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
    .home-scene::-webkit-scrollbar{display:none}
  }
  @media (max-height:760px) and (min-width:721px){
    .home-scene{grid-template-rows:auto minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
    .home-scene::-webkit-scrollbar{display:none}
  }`;

const VIEWPORTS = [[1536, 864], [1280, 800], [1920, 1080], [1366, 768], [1024, 575], [1100, 800]];

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

for (const [w, h] of VIEWPORTS) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
  // đợi loader biến mất hẳn
  await page.waitForFunction(
    () => {
      const l = document.querySelector('.initial-loader');
      if (!l) return true;
      const s = getComputedStyle(l);
      return s.opacity === '0' || s.visibility === 'hidden' || s.display === 'none';
    },
    { timeout: 15000 },
  ).catch(() => {});
  await page.waitForTimeout(2500);
  await page.addStyleTag({ content: PATCH });
  await page.waitForTimeout(1200);

  const pairs = await page.evaluate(() => {
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
    // bỏ qua loader + footer fixed
    const SKIP = '.initial-loader, .frame-footer, .frame-body > footer';
    const leaves = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest(SKIP)) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
      if (!own) continue;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      leaves.push({ el, r, text: el.textContent.trim().slice(0, 30), path: path(el) });
    }
    const out = [];
    for (let i = 0; i < leaves.length; i++) {
      for (let j = i + 1; j < leaves.length; j++) {
        const A = leaves[i].el, B = leaves[j].el;
        if (A.contains(B) || B.contains(A)) continue;
        const a = leaves[i].r, b = leaves[j].r;
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ox > 2 && oy > 2) {
          out.push({ a: leaves[i].text, ap: leaves[i].path, b: leaves[j].text, bp: leaves[j].path, ox: Math.round(ox), oy: Math.round(oy) });
        }
      }
    }
    out.sort((x, y) => y.oy - x.oy);
    return out;
  });

  console.log(`\n===== ${w}x${h} — ${pairs.length} cặp chồng (đã bỏ loader/footer) =====`);
  for (const p of pairs) {
    console.log(`  oy=${p.oy} ox=${p.ox}`);
    console.log(`    A "${p.a}"\n      ${p.ap}`);
    console.log(`    B "${p.b}"\n      ${p.bp}`);
  }
  await page.screenshot({ path: `${OUT}clean-${w}x${h}.png` });
}

await browser.close();
