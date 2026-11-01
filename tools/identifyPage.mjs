/**
 * Pixel-diff ảnh user với cả trang chủ và trang /credentials ở nhiều viewport,
 * để xác định chắc chắn ảnh user là trang nào + viewport nào.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/';
const USER_IMG =
  'C:/Users/kimvi/.cursor/projects/d-GitHub-My-Portfolio-CatKod/assets/c__Users_kimvi_AppData_Roaming_Cursor_User_workspaceStorage_854f6971d3356585d10defa7398d6fe0_images_image-e819aa44-6ef4-4e85-b2aa-1707d5202935.png';
const USER_B64 = readFileSync(USER_IMG).toString('base64');

const PAGES = ['https://catkod.github.io/', 'https://catkod.github.io/credentials/'];
const VIEWPORTS = [
  [1536, 864], [1492, 751], [1920, 1080], [1280, 720], [1366, 768],
  [1024, 575], [1440, 810], [1600, 900], [1536, 800],
];

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();
const cmp = await ctx.newPage();
await cmp.goto('about:blank');

const results = [];
for (const url of PAGES) {
  for (const [w, h] of VIEWPORTS) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const b64 = (await page.screenshot({ type: 'png' })).toString('base64');

    const diff = await cmp.evaluate(
      async ([u, c]) => {
        const load = (b64) =>
          new Promise((res, rej) => {
            const im = new Image();
            im.onload = () => res(im);
            im.onerror = rej;
            im.src = 'data:image/png;base64,' + b64;
          });
        const [a, b] = await Promise.all([load(u), load(c)]);
        const TW = 1024, TH = 575;
        const draw = (im) => {
          const cv = document.createElement('canvas');
          cv.width = TW; cv.height = TH;
          const g = cv.getContext('2d');
          g.drawImage(im, 0, 0, TW, TH);
          return g.getImageData(0, 0, TW, TH).data;
        };
        const da = draw(a), db = draw(b);
        let sum = 0;
        for (let i = 0; i < da.length; i += 4) {
          sum += Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
        }
        return +(sum / (TW * TH * 3)).toFixed(2);
      },
      [USER_B64, b64],
    );

    results.push({ url, w, h, diff });
    console.log(`  ${url.replace('https://catkod.github.io', '') || '/'}  ${String(w).padStart(4)}x${String(h).padStart(4)}  diff=${diff}`);
  }
}

results.sort((a, b) => a.diff - b.diff);
console.log('\n=== 6 kết quả tốt nhất ===');
for (const r of results.slice(0, 6)) {
  console.log(`  ${r.url}  ${r.w}x${r.h}  diff=${r.diff}`);
}

await browser.close();
