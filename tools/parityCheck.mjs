/**
 * So sánh chính xác nội dung DOM server render với DOM sau hydration.
 *
 * So sánh theo từng element (kể cả text node) sau khi đã bỏ comment `<!-- -->`
 * mà React chèn giữa các text node liên tiếp — vì những comment đó là
 * artifact của cách React serialize text, không phải khác biệt nội dung.
 */
import { chromium } from 'playwright';

const routes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['/', '/about', '/work', '/skills', '/credentials', '/guestbook', '/contact'];
const base = process.env.BASE || 'http://localhost:9310';

/**
 * Chuỗi biểu diễn cây DOM, bỏ comment và thuộc tính style (animation runtime).
 *
 * Bỏ qua các vùng có nội dung động theo thời gian, không phải khác biệt
 * hydration:
 *   - `.initial-loader`      — loader đổi chữ "Hello" → "こんにちは" → ...
 *   - `.google-language-switch` và `#google_translate_element` — widget Translate
 *   - `.initial-loader` canvas — vẽ nền runtime
 */
const NORMALIZE = `(() => {
  const SKIP = ['initial-loader', 'google-language-switch', 'google-translate-element'];
  const walk = (node) => {
    if (node.nodeType === 3) return node.textContent.replace(/\\s+/g, ' ').trim();
    if (node.nodeType !== 1) return '';
    const tag = node.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style') return '';
    if (tag === 'next-route-announcer') return '';
    if ((node.className && typeof node.className === 'string' &&
         SKIP.some((c) => node.className.split(/\\s+/).includes(c))) ||
        node.id === 'google_translate_element' ||
        node.id.startsWith('cf-chl-widget')) return '';
    const attrs = [...node.attributes]
      .filter((a) => {
        if (a.name === 'style' || a.name === 'class') return false;
        // canvas được resize lúc runtime, không phải khác biệt hydration
        if (tag === 'canvas' && (a.name === 'width' || a.name === 'height')) return false;
        // id của gradient sinh runtime bằng useId
        if (/dot-field-glow-/.test(a.value)) return false;
        return true;
      })
      .map((a) => a.name + '=' + a.value)
      .sort()
      .join(' ');
    const kids = [...node.childNodes].map(walk).filter(Boolean);
    return '<' + tag + ' ' + attrs + '>' + kids.join('') + '</' + tag + '>';
  };
  return walk(document.body);
})()`;

/**
 * Chặn Google Translate.
 *
 * Widget translate dịch thẳng text node trong DOM. Nếu nó chạy trước lúc
 * React hydrate, React thấy DOM khác với cây component → báo lỗi #418
 * (mismatch text). Đây là hành vi của bên thứ ba, không phải lỗi site —
 * nên khi kiểm tra parity ta chặn nó đi.
 */
const blockTranslate = (route) => {
  const url = route.request().url();
  if (/translate\.google|translate\.googleapis|\/translate_a\/|gtranslate/i.test(url)) {
    return route.abort();
  }
  return route.continue();
};

const browser = await chromium.launch({ channel: 'chrome' });
let bad = 0;

for (const r of routes) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await ctx.route('**/*', blockTranslate);

  await page.route('**/_next/static/chunks/**', (route) => route.abort());
  await page.goto(base + r, { waitUntil: 'domcontentloaded' });
  const ssr = await page.evaluate(NORMALIZE);
  await page.unroute('**/_next/static/chunks/**');

  await page.goto(base + r, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const client = await page.evaluate(NORMALIZE);

  const reactErr = errors.filter((e) => /418|423|425|Connection closed|hydrat/i.test(e));
  const other = errors.filter((e) => !/418|423|425|Connection closed|hydrat/i.test(e));

  let diffAt = -1;
  for (let i = 0; i < Math.max(ssr.length, client.length); i++) {
    if (ssr[i] !== client[i]) { diffAt = i; break; }
  }
  const same = diffAt === -1;
  if (!same) bad++;

  console.log(
    (same ? 'OK   ' : 'DIFF ') + r.padEnd(13),
    'ssr', ssr.length, 'client', client.length,
  );
  if (!same) {
    console.log('   lệch tại vị trí ' + diffAt);
    console.log('   SSR   : ' + JSON.stringify(ssr.slice(Math.max(0, diffAt - 120), diffAt + 220)));
    console.log('   CLIENT: ' + JSON.stringify(client.slice(Math.max(0, diffAt - 120), diffAt + 220)));
  }
  if (reactErr.length) console.log('   ! ' + reactErr.join(' | ').slice(0, 180));
  if (other.length) console.log('   other: ' + other.join(' | ').slice(0, 140));

  await ctx.close();
}
await browser.close();
console.log(bad === 0 ? '\nALL CLEAN' : '\n' + bad + ' route(s) khác DOM');
