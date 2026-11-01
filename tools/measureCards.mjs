/**
 * Đo chi tiết 4 thẻ capability ở viewport thật của user (1536x864).
 * Kiểm tra xem text trong thẻ có bị tràn ra ngoài thẻ (gây chồng với thẻ kế bên)
 * không.
 */
import { chromium } from 'playwright';

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
  }`;

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

for (const [w, h] of [[1536, 864], [1920, 1080], [1280, 800]]) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
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

  const d = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.home-capability-card')];
    const grid = document.querySelector('.home-capability-grid');
    const gb = grid.getBoundingClientRect();
    return {
      grid: { x: Math.round(gb.x), y: Math.round(gb.y), w: Math.round(gb.width), h: Math.round(gb.height) },
      gridCols: getComputedStyle(grid).gridTemplateColumns,
      cards: cards.map((c) => {
        const b = c.getBoundingClientRect();
        const s = getComputedStyle(c);
        const kids = [...c.children].map((k) => {
          const kb = k.getBoundingClientRect();
          const ks = getComputedStyle(k);
          return {
            tag: k.tagName.toLowerCase() + '.' + (k.className || '').split(/\s+/)[0],
            text: k.textContent.trim().slice(0, 22),
            x: Math.round(kb.x), y: Math.round(kb.y), w: Math.round(kb.width), h: Math.round(kb.height),
            scrollH: k.scrollHeight, clientH: k.clientHeight,
            overflow: ks.overflow, fontSize: ks.fontSize, lineHeight: ks.lineHeight,
          };
        });
        return {
          x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
          scrollH: c.scrollHeight, clientH: c.clientHeight, overflow: s.overflow,
          minH: s.minHeight, alignContent: s.alignContent,
          kids,
        };
      }),
    };
  });

  console.log(`\n========== ${w}x${h} ==========`);
  console.log(`grid: ${JSON.stringify(d.grid)}`);
  console.log(`cols: ${d.gridCols}`);
  for (const [i, c] of d.cards.entries()) {
    console.log(`\n card[${i}] x=${c.x} y=${c.y} ${c.w}x${c.h}  scrollH=${c.scrollH} clientH=${c.clientH} overflow=${c.overflow} minH=${c.minH} align=${c.alignContent}`);
    for (const k of c.kids) {
      const over = k.scrollH > k.clientH + 1 ? `  <<< TRÀN ${k.scrollH - k.clientH}px` : '';
      console.log(`   ${k.tag.padEnd(28)} ${JSON.stringify({ x: k.x, y: k.y, w: k.w, h: k.h })}${over}`);
      console.log(`      "${k.text}" fs=${k.fontSize} lh=${k.lineHeight}`);
    }
  }
}

await browser.close();
