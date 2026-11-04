import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.route('**/*', r => /translate\.google/.test(r.request().url()) ? r.abort() : r.continue());

for (const vp of [
  { w: 1024, h: 575 },
  { w: 1150, h: 700 },
  { w: 1280, h: 800 },
  { w: 1366, h: 768 },
  { w: 1440, h: 900 },
  { w: 1492, h: 751 },
  { w: 1920, h: 1080 }
]) {
  await page.setViewportSize({ width: vp.w, height: vp.h });
  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
  await page.waitForSelector('.initial-loader', { state: 'detached', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(500);

  const layout = await page.evaluate(() => {
    const box = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        gridArea: s.gridArea,
        gridColumn: s.gridColumn,
        gridRow: s.gridRow,
        display: s.display,
        position: s.position
      };
    };
    const scene = document.querySelector('.home-scene');
    const sScene = scene ? getComputedStyle(scene) : null;
    return {
      sceneGrid: sScene ? {
        cols: sScene.gridTemplateColumns,
        rows: sScene.gridTemplateRows,
        areas: sScene.gridTemplateAreas
      } : null,
      title: box('.home-title'),
      intro: box('.home-intro'),
      system: box('.home-system'),
      grid: box('.home-capability-grid')
    };
  });

  console.log(`\n=== VIEWPORT ${vp.w}x${vp.h} ===`);
  console.log('Scene cols:', layout.sceneGrid?.cols);
  console.log('Scene rows:', layout.sceneGrid?.rows);
  console.log('Title rect:', layout.title?.rect);
  console.log('Intro rect:', layout.intro?.rect);
  console.log('System rect:', layout.system?.rect);
  console.log('System gridArea:', layout.system?.gridArea, 'gridCol:', layout.system?.gridColumn, 'gridRow:', layout.system?.gridRow);
}

await browser.close();
