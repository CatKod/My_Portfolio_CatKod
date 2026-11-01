/**
 * VÁ NHÓM 721-1100px + max-height:760px.
 *
 * Vấn đề giống nhau: hàng 2 là `minmax(0,1fr)` nên bị ép về 0, item ở hàng 2
 * (align-self:start) tràn chồng lên hàng 3.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  [1536, 864], [1536, 800], [1492, 751], [1280, 800], [1280, 720],
  [1366, 768], [1150, 700], [1100, 800], [1100, 700], [1024, 700],
  [1024, 600], [1024, 575], [1600, 900], [1920, 1080], [1440, 900],
  [1280, 900], [900, 700], [800, 600], [768, 1024], [1024, 768],
];

const COMMON = `
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
  }`;

const VARIANTS = {
  'E-narrow-mincontent': COMMON + `
    @media (max-width:1100px) and (min-width:721px){
      .home-scene{grid-template-rows:auto minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
      .home-scene::-webkit-scrollbar{display:none}
    }
    @media (max-height:760px) and (min-width:721px){
      .home-scene{grid-template-rows:auto minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
      .home-scene::-webkit-scrollbar{display:none}
    }`,

  'F-narrow-plus-tight': COMMON + `
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
    }`,
};

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

const measure = () =>
  page.evaluate(() => {
    const R = (el) => {
      const b = el.getBoundingClientRect();
      return { y: Math.round(b.y), h: Math.round(b.height) };
    };
    const scene = document.querySelector('.home-scene');
    const intro = document.querySelector('.home-intro');
    const system = document.querySelector('.home-system');
    if (!intro || !system) return { err: 'no el' };
    const a = intro.getBoundingClientRect(), b = system.getBoundingClientRect();
    const leaves = [];
    for (const el of document.querySelectorAll('body *')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
      if (!own) continue;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      leaves.push({ el, r });
    }
    let hits = 0;
    for (let i = 0; i < leaves.length; i++) {
      for (let j = i + 1; j < leaves.length; j++) {
        const A = leaves[i].el, B = leaves[j].el;
        if (A.contains(B) || B.contains(A)) continue;
        const x = leaves[i].r, y = leaves[j].r;
        const ox = Math.min(x.right, y.right) - Math.max(x.left, y.left);
        const oy = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top);
        if (ox > 2 && oy > 2) hits++;
      }
    }
    return {
      overlap: Math.round(Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)),
      hits,
      title: R(document.querySelector('.home-title')),
      intro: R(intro),
      system: R(system),
      overflowY: getComputedStyle(scene).overflowY,
      sceneTran: scene.scrollHeight - scene.clientHeight,
      docTran: document.documentElement.scrollHeight - window.innerHeight,
    };
  });

for (const [name, css] of Object.entries(VARIANTS)) {
  console.log(`\n########## ${name} ##########`);
  let bad = 0;
  for (const [w, h] of VIEWPORTS) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.addStyleTag({ content: css });
    await page.waitForTimeout(800);
    const d = await measure();
    const flag = d.hits > 0 || d.overlap > 0 ? '  <<< LỖI' : '';
    if (flag) bad++;
    console.log(
      `  ${String(w).padStart(4)}x${String(h).padStart(4)}  overlap=${String(d.overlap).padStart(4)}  hits=${String(d.hits).padStart(2)}  ` +
        `title.h=${String(d.title?.h).padStart(3)} intro.h=${String(d.intro?.h).padStart(3)} sys.h=${String(d.system?.h).padStart(3)}  ` +
        `overflowY=${d.overflowY} sceneTran=${d.sceneTran} docTran=${d.docTran}${flag}`,
    );
  }
  console.log(`  => ${bad}/${VIEWPORTS.length} còn lỗi`);
  for (const [w, h] of [[1536, 864], [1024, 575], [1100, 800]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.addStyleTag({ content: css });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}var2-${name}-${w}x${h}.png` });
  }
}

await browser.close();
