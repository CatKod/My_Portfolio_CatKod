import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:9313';
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
    await page.waitForTimeout(4000);

    const bad = await page.evaluate(() => {
      const out = [];
      const isVisible = (el) => {
        // bỏ qua phần tử bị ẩn bởi ancestor (display:none / visibility:hidden)
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.display === 'none' || cs.visibility === 'hidden') return false;
          if (cs.opacity === '0') return false;
        }
        const box = el.getBoundingClientRect();
        // bỏ qua phần tử nằm ngoài viewport theo chiều ngang (menu ẩn)
        if (box.right < 0 || box.left > window.innerWidth) return false;
        return true;
      };
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.overflow !== 'hidden' && cs.overflowY !== 'hidden') continue;
        const text = (el.textContent || '').trim();
        if (!text) continue;
        const hasOwn = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!hasOwn) continue;
        if (!isVisible(el)) continue;
        const box = el.getBoundingClientRect();
        const kind = box.height <= 0.5 ? 'COLLAPSE' : el.scrollHeight > el.clientHeight + 1 ? 'CUT' : null;
        if (!kind) continue;
        out.push({
          kind,
          tag: el.tagName.toLowerCase(),
          cls: typeof el.className === 'string' ? el.className : '',
          text: text.slice(0, 46),
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
      for (const b of bad.slice(0, 12)) {
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
