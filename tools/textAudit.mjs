/**
 * Quét mọi route xem có phần tử nào bị MẤT CHỮ không:
 *   - collapse: có nội dung nhưng chiều cao render = 0 (chữ biến mất hẳn)
 *   - cut:      overflow:hidden còn nội dung bị cắt (scrollHeight > clientHeight)
 *
 * Nguyên nhân gốc: Chrome 154 đã bỏ hỗ trợ `-webkit-line-clamp` legacy.
 * Rule cũ dùng `display:-webkit-box` + `-webkit-line-clamp` + `overflow:hidden`;
 * trong Chrome mới, `display:-webkit-box` bị hạ về `flow-root`, phần tử thành
 * grid item có automatic minimum size = 0 nên track grid co về 0 -> mất chữ.
 */
import { chromium } from 'playwright';

const base = process.argv[2] || 'https://catkod.github.io';
const routes = ['/', '/about/', '/work/', '/skills/', '/credentials/', '/guestbook/', '/contact/'];
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch({ channel: 'chrome' });
let total = 0;

for (const vp of viewports) {
  console.log('\n===== ' + vp.name + ' (' + vp.width + 'x' + vp.height + ') =====');
  for (const r of routes) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await page.goto(base + r, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    const bad = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (cs.overflow !== 'hidden' && cs.overflowY !== 'hidden') continue;
        const text = (el.textContent || '').trim();
        if (!text) continue;
        const hasOwn = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!hasOwn) continue;
        const box = el.getBoundingClientRect();
        const kind = box.height <= 0.5 ? 'COLLAPSE' : el.scrollHeight > el.clientHeight + 1 ? 'CUT' : null;
        if (!kind) continue;
        out.push({
          kind,
          tag: el.tagName.toLowerCase(),
          cls: typeof el.className === 'string' ? el.className : '',
          text: text.slice(0, 50),
          h: Math.round(box.height),
          clientH: el.clientHeight,
          scrollH: el.scrollHeight,
          display: cs.display,
        });
      }
      return out;
    });

    if (bad.length) {
      total += bad.length;
      console.log('FAIL ' + r + '  (' + bad.length + ')');
      for (const b of bad.slice(0, 10)) {
        console.log(
          '   ' + b.kind.padEnd(8) + ' <' + b.tag + ' class="' + b.cls + '"> h=' + b.h +
            ' client=' + b.clientH + ' scroll=' + b.scrollH +
            ' display=' + b.display + '  "' + b.text + '"',
        );
      }
    } else {
      console.log('OK   ' + r);
    }
    await ctx.close();
  }
}
await browser.close();
console.log(total === 0 ? '\nTOTAT KHONG CO VAN DE' : '\nTONG: ' + total + ' van de');
