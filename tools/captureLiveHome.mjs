import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini';
mkdirSync(OUT, { recursive: true });

const viewports = [
  { w: 1024, h: 575 },
  { w: 1150, h: 700 },
  { w: 1280, h: 800 },
  { w: 1366, h: 768 },
  { w: 1440, h: 900 },
  { w: 1492, h: 751 },
  { w: 1920, h: 1080 }
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', r => /translate\.google/.test(r.request().url()) ? r.abort() : r.continue());

for (const vp of viewports) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width: vp.w, height: vp.h });
  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
  // Wait for initial loader to complete and detach
  await page.waitForSelector('.initial-loader', { state: 'detached', timeout: 15000 }).catch(() => {});
  // Then wait additional 2.5s as requested
  await page.waitForTimeout(2500);

  const shotPath = join(OUT, `gemini-home-${vp.w}x${vp.h}.png`);
  await page.screenshot({ path: shotPath });
  console.log(`Saved ${shotPath}`);
  await page.close();
}

await browser.close();
console.log('All screenshots captured with home page visible!');
