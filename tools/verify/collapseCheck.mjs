/**
 * Tìm mọi phần tử có chữ nhưng bị sụp chiều cao về 0 trên desktop.
 *
 * Nguyên nhân gốc: rule CSS dùng cơ chế cắt dòng legacy
 * (`display:-webkit-box` + `-webkit-line-clamp` + `overflow:hidden`).
 * Trong Chrome 154, `display:-webkit-box` không còn được áp dụng cho phần tử
 * có `-webkit-line-clamp`, nên phần tử trở thành grid item với
 * `overflow:hidden` — automatic minimum size của nó là 0, nên track grid co
 * lại về 0 và chữ biến mất.
 */
import { chromium } from 'playwright';

const base = process.argv[2] || 'https://catkod.github.io';
const routes = ['/', '/about/', '/work/', '/skills/', '/credentials/', '/guestbook/', '/contact/'];

const browser = await chromium.launch({ channel: 'chrome' });
let total = 0;

for (const r of routes) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base + r, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);

  const collapsed = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const text = (el.textContent || '').trim();
      if (!text) continue;
      // chỉ xét phần tử có text node trực tiếp
      const hasOwn = [...el.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim(),
      );
      if (!hasOwn) continue;
      const rect = el.getBoundingClientRect();
      if (rect.height > 0.5) continue;
      const cs = getComputedStyle(el);
      // Phần tử không thực sự hiển thị (display:none, visibility:hidden) thì
      // chiều cao 0 là đúng — không phải lỗi.
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      // Phần tử không có nội dung thật (option, script) thì bỏ qua.
      if (el.scrollHeight === 0) continue;
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: el.className && typeof el.className === 'string' ? el.className : '',
        text: text.slice(0, 55),
        display: cs.display,
        overflow: cs.overflow,
        clamp: cs.webkitLineClamp,
        scrollH: el.scrollHeight,
      });
    }
    return out;
  });

  if (collapsed.length) {
    total += collapsed.length;
    console.log('FAIL ' + r + '  (' + collapsed.length + ' phần tử bị sụp)');
    for (const c of collapsed.slice(0, 12)) {
      console.log(
        '   <' + c.tag + ' class="' + c.cls + '"> display=' + c.display +
          ' overflow=' + c.overflow + ' clamp=' + c.clamp +
          ' scrollH=' + c.scrollH + '  "' + c.text + '"',
      );
    }
  } else {
    console.log('OK   ' + r);
  }
  await ctx.close();
}
await browser.close();
console.log(total === 0 ? '\nKHONG CO PHAN TU BI SUP' : '\n' + total + ' phần tử bị sụp chiều cao');
