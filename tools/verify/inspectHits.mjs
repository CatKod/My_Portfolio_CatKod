/**
 * Liệt kê CHÍNH XÁC các cặp text đang chồng nhau, kèm selector + số px,
 * để phân biệt lỗi thật với false positive (decorative overlay).
 */
import { chromium } from 'playwright';

const PATCH = `
  @media (min-width:1180px){
    .home-scene{grid-template-rows:min-content minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
    .home-scene::-webkit-scrollbar{display:none}
  }
  @media (min-width:1180px) and (max-height:900px){
    .stage.stage--home .home-title{padding-top:clamp(48px,6vh,76px)}
    .home-title h1{font-size:clamp(2.9rem,4.6vw,4.5rem)}
    .home-intro{padding-top:clamp(10px,1.3vh,16px)}
    .home-intro p{font-size:clamp(1.3rem,2.1vw,2.05rem)}
    .home-scene{gap:clamp(10px,1.4vw,18px)}
    .home-capability-card{min-height:112px}
  }
  @media (max-width:1100px) and (min-width:721px){
    .home-scene{grid-template-rows:auto minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
    .home-scene::-webkit-scrollbar{display:none}
    .home-title{padding-top:clamp(28px,4vh,40px)}
    .home-intro{padding-top:clamp(6px,1vh,14px)}
    .home-intro p{font-size:clamp(1.7rem,2.9vw,2.3rem)}
    .home-capability-card{min-height:96px}
  }
  @media (max-height:760px) and (min-width:721px){
    .home-scene{grid-template-rows:auto minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
    .home-scene::-webkit-scrollbar{display:none}
    .home-title{padding-top:clamp(18px,2.6vh,30px)}
    .home-title h1{font-size:clamp(2.5rem,4.3vw,4rem)}
    .home-intro{padding-top:4px}
    .home-intro p{font-size:clamp(1.15rem,2vw,1.8rem)}
    .home-capability-card{min-height:72px;padding:9px 11px}
  }`;

const VIEWPORTS = [[1536, 864], [1280, 800], [1024, 575], [1920, 1080], [1100, 800]];

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

for (const [w, h] of VIEWPORTS) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  await page.addStyleTag({ content: PATCH });
  await page.waitForTimeout(900);

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
    const leaves = [];
    for (const el of document.querySelectorAll('body *')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
      if (!own) continue;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      leaves.push({ el, r, text: el.textContent.trim().slice(0, 28), path: path(el) });
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
          out.push({
            a: leaves[i].text, ap: leaves[i].path,
            b: leaves[j].text, bp: leaves[j].path,
            ox: Math.round(ox), oy: Math.round(oy),
            aPos: getComputedStyle(A).position, bPos: getComputedStyle(B).position,
            aZ: getComputedStyle(A).zIndex, bZ: getComputedStyle(B).zIndex,
          });
        }
      }
    }
    out.sort((x, y) => y.oy - x.oy);
    return out;
  });

  console.log(`\n===== ${w}x${h} — ${pairs.length} cặp chồng =====`);
  for (const p of pairs) {
    console.log(`  oy=${p.oy} ox=${p.ox}`);
    console.log(`    A [${p.aPos} z=${p.aZ}] "${p.a}"\n      ${p.ap}`);
    console.log(`    B [${p.bPos} z=${p.bZ}] "${p.b}"\n      ${p.bp}`);
  }
}

await browser.close();
