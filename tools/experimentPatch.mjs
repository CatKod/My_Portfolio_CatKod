/**
 * THỰC NGHIỆM bản vá CSS cho lỗi chồng chữ trang chủ.
 *
 * Nguyên nhân gốc (đã xác nhận):
 *   .home-scene { grid-template-rows: min-content minmax(0,1fr) min-content }
 *   .home-title  { grid-area: 1/1 }
 *   .home-intro  { grid-area: 2/1; align-self: start }
 *   .home-system { grid-area: 3/1/auto/-1 }
 * Ở >=1180px grid có 2 cột. Hàng 2 là `minmax(0,1fr)` nên khi
 * title + system chiếm hết chỗ, hàng 2 bị ép về 0px. .home-intro cao 225px
 * với align-self:start => TRÀN ra khỏi track và CHỒNG LÊN .home-system.
 *
 * Script này inject CSS vào trang live, đo chồng lấn ở nhiều viewport và
 * chọn bản vá không chồng + giữ gần diện mạo gốc nhất.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  [1536, 864], [1536, 800], [1536, 900], [1492, 751], [1280, 800],
  [1280, 720], [1366, 768], [1150, 700], [1100, 800], [1024, 700],
  [1600, 900], [1920, 1080], [1440, 900], [1280, 900], [1024, 575],
];

const VARIANTS = {
  baseline: '',

  // A. hàng 2 không được co về 0 + cuộn được khi tràn
  'A-mincontent': `
    @media (min-width:1180px){
      .home-scene{grid-template-rows:min-content minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
      .home-scene::-webkit-scrollbar{display:none}
    }`,

  // B. A + giảm chiều cao title ở màn không cao lắm
  'B-tight-title': `
    @media (min-width:1180px){
      .home-scene{grid-template-rows:min-content minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
      .home-scene::-webkit-scrollbar{display:none}
    }
    @media (min-width:1180px) and (max-height:900px){
      .stage.stage--home .home-title{padding-top:clamp(56px,7vh,84px)}
      .home-title h1{font-size:clamp(2.9rem,5vw,4.9rem)}
      .home-intro{padding-top:clamp(12px,1.6vh,20px)}
      .home-scene{gap:clamp(12px,1.6vw,20px)}
    }`,

  // C. B + giảm card tối thiểu
  'C-tight-cards': `
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
    }`,

  // D. chỉ dùng min-content + co title (không cuộn)
  'D-noscroll': `
    @media (min-width:1180px){
      .home-scene{grid-template-rows:min-content minmax(min-content,1fr) min-content}
    }
    @media (min-width:1180px) and (max-height:900px){
      .stage.stage--home .home-title{padding-top:clamp(40px,5vh,64px)}
      .home-title h1{font-size:clamp(2.9rem,4.4vw,4.3rem)}
      .home-intro{padding-top:clamp(8px,1vh,14px)}
      .home-intro p{font-size:clamp(1.25rem,2vw,1.95rem)}
      .home-scene{gap:clamp(8px,1.2vw,16px)}
      .home-capability-card{min-height:104px;padding:11px 14px}
      .home-system-head{padding:11px 14px}
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
      return { y: Math.round(b.y), h: Math.round(b.height), x: Math.round(b.x), w: Math.round(b.width) };
    };
    const scene = document.querySelector('.home-scene');
    const intro = document.querySelector('.home-intro');
    const system = document.querySelector('.home-system');
    const title = document.querySelector('.home-title');
    if (!intro || !system) return { err: 'no el' };
    const a = intro.getBoundingClientRect();
    const b = system.getBoundingClientRect();

    // đếm chỗ chồng chữ text
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
        const a = leaves[i].r, c = leaves[j].r;
        const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left);
        const oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
        if (ox > 2 && oy > 2) hits++;
      }
    }
    return {
      overlap: Math.round(Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)),
      hits,
      title: R(title),
      intro: R(intro),
      system: R(system),
      rows: getComputedStyle(scene).gridTemplateRows,
      sceneOverflow: scene.scrollHeight - scene.clientHeight,
      sceneScrollable: getComputedStyle(scene).overflowY,
    };
  });

for (const [name, css] of Object.entries(VARIANTS)) {
  console.log(`\n########## ${name} ##########`);
  let bad = 0;
  for (const [w, h] of VIEWPORTS) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2200);
    if (css) await page.addStyleTag({ content: css });
    await page.waitForTimeout(900);
    const d = await measure();
    const flag = d.hits > 0 || d.overlap > 0 ? '  <<< LỖI' : '';
    if (flag) bad++;
    console.log(
      `  ${String(w).padStart(4)}x${String(h).padStart(4)}  overlap=${String(d.overlap).padStart(4)}  hits=${String(d.hits).padStart(2)}  ` +
        `title.h=${String(d.title?.h).padStart(3)}  intro.h=${String(d.intro?.h).padStart(3)}  sys.h=${String(d.system?.h).padStart(3)}  ` +
        `overflowY=${d.sceneScrollable} tràn=${d.sceneOverflow}${flag}`,
    );
  }
  console.log(`  => ${bad}/${VIEWPORTS.length} viewport còn lỗi`);
  if (name === 'C-tight-cards' || name === 'D-noscroll') {
    for (const [w, h] of [[1536, 864], [1280, 800], [1920, 1080]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2200);
      if (css) await page.addStyleTag({ content: css });
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${OUT}var-${name}-${w}x${h}.png` });
    }
  }
}

await browser.close();
