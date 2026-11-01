/**
 * Tìm viewport CSS khớp ảnh chụp của người dùng bằng PIXEL DIFF.
 *
 * Ảnh user: 1024x575 (tỉ lệ 1.781 ~ 16:9 của màn 1920x1080).
 * Render trang chủ ở nhiều viewport, chụp ảnh, resize về 1024x575 rồi so
 * từng pixel với ảnh user. Viewport có diff nhỏ nhất là ứng viên đúng.
 *
 * So sánh được thực hiện trong chính browser (canvas) để không cần sharp.
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const OUT = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/';
mkdirSync(OUT, { recursive: true });

const USER_IMG =
  'C:/Users/kimvi/.cursor/projects/d-GitHub-My-Portfolio-CatKod/assets/c__Users_kimvi_AppData_Roaming_Cursor_User_workspaceStorage_854f6971d3356585d10defa7398d6fe0_images_image-e819aa44-6ef4-4e85-b2aa-1707d5202935.png';
const USER_B64 = readFileSync(USER_IMG).toString('base64');

const CANDIDATES = [
  [1024, 575], [1152, 648], [1280, 720], [1366, 768], [1440, 810],
  [1492, 751], [1536, 864], [1600, 900], [1680, 945], [1728, 972],
  [1920, 1080], [1280, 800], [1440, 900], [1366, 768],
];

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
await ctx.route('**/*', (r) =>
  /translate\.google|translate\.googleapis/.test(r.request().url()) ? r.abort() : r.continue(),
);
const page = await ctx.newPage();

// trang so sanh
const cmp = await ctx.newPage();
await cmp.goto('about:blank');

const shots = [];
for (const [w, h] of CANDIDATES) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const buf = await page.screenshot({ type: 'png' });
  const b64 = buf.toString('base64');
  shots.push({ w, h, b64 });

  const diff = await cmp.evaluate(
    async ([userB64, candB64]) => {
      const load = (b64) =>
        new Promise((res, rej) => {
          const im = new Image();
          im.onload = () => res(im);
          im.onerror = rej;
          im.src = 'data:image/png;base64,' + b64;
        });
      const [a, b] = await Promise.all([load(userB64), load(candB64)]);

      const TW = 1024, TH = 575;
      const draw = (im) => {
        const c = document.createElement('canvas');
        c.width = TW; c.height = TH;
        const g = c.getContext('2d');
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

  console.log(`  ${String(w).padStart(4)}x${String(h).padStart(4)}  pixel-diff trung binh = ${diff}`);
  shots[shots.length - 1].diff = diff;
}

shots.sort((x, y) => x.diff - y.diff);
console.log('\n=== 5 ung vien tot nhat ===');
for (const s of shots.slice(0, 5)) console.log(`  ${s.w}x${s.h}  diff=${s.diff}`);

const best = shots[0];
console.log(`\n=> viewport phu hop nhat: ${best.w}x${best.h} (diff=${best.diff})`);

// Luu anh cua 3 ung vien tot nhat de so sanh bang mat
for (const s of shots.slice(0, 3)) {
  writeFileSync(OUT + `best-${s.w}x${s.h}.png`, Buffer.from(s.b64, 'base64'));
}
writeFileSync(OUT + 'user-reference.png', Buffer.from(USER_B64, 'base64'));

await browser.close();
