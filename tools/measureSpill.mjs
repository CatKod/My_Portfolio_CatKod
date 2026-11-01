/**
 * Đo chồng lấn giữa các THẺ capability (text trong thẻ này tràn sang thẻ kế bên).
 * Vấn đề: `h2{max-width:170px}` cố định -> ở cột hẹp, chữ 2 dòng vẫn rộng hơn
 * cột và tràn sang thẻ bên cạnh.
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
  }
  @media (max-width:1100px) and (min-width:721px){
    .home-scene{grid-template-rows:auto minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
    .home-scene::-webkit-scrollbar{display:none}
  }
  @media (max-height:760px) and (min-width:721px){
    .home-scene{grid-template-rows:auto minmax(min-content,1fr) min-content;overflow-y:auto;scrollbar-width:none}
    .home-scene::-webkit-scrollbar{display:none}
  }`;

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

for (const [w, h] of [[1536, 864], [1280, 800], [1920, 1080]]) {
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
  await page.waitForTimeout(1000);

  const d = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.home-capability-card')];
    const info = cards.map((c) => {
      const b = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      const kids = [...c.children].map((k) => {
        const kb = k.getBoundingClientRect();
        const ks = getComputedStyle(k);
        return {
          tag: k.tagName.toLowerCase(),
          text: k.textContent.trim().slice(0, 20),
          left: Math.round(kb.left), right: Math.round(kb.right),
          w: Math.round(kb.width),
          maxW: ks.maxWidth, fs: ks.fontSize, overflow: ks.overflow,
          whiteSpace: ks.whiteSpace, overflowWrap: ks.overflowWrap, wordBreak: ks.wordBreak,
        };
      });
      return {
        card: { left: Math.round(b.left), right: Math.round(b.right), w: Math.round(b.width) },
        padL: cs.paddingLeft, padR: cs.paddingRight,
        kids,
      };
    });
    // so text voi card ke ben
    const spills = [];
    info.forEach((c, i) => {
      for (const k of c.kids) {
        const contentRight = c.card.right - parseFloat(c.padR);
        if (k.right > contentRight + 0.5) {
          spills.push({
            card: i, text: k.text, kind: k.tag,
            textRight: k.right, contentRight: Math.round(contentRight),
            tran: Math.round(k.right - contentRight),
          });
        }
      }
    });
    return { info, spills };
  });

  console.log(`\n===== ${w}x${h} =====`);
  for (const [i, c] of d.info.entries()) {
    console.log(` card[${i}] left=${c.card.left} right=${c.card.right} w=${c.card.w} pad=${c.padL}/${c.padR}`);
    for (const k of c.kids) {
      console.log(`    ${k.tag.padEnd(5)} "${k.text}" left=${k.left} right=${k.right} w=${k.w} maxW=${k.maxW} fs=${k.fs} ws=${k.whiteSpace} ow=${k.overflowWrap} wb=${k.wordBreak}`);
    }
  }
  console.log(` TRÀN RA NGOÀI THẺ: ${d.spills.length}`);
  for (const s of d.spills) console.log(`   card[${s.card}] ${s.kind} "${s.text}" tràn ${s.tran}px`);
}

await browser.close();
