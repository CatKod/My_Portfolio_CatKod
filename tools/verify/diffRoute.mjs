/**
 * Diff DOM SSR vs DOM sau hydration cho một route, bỏ qua các vùng động.
 *
 * Dùng để tìm chính xác chỗ React báo hydration mismatch.
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const route = process.argv[2] || '/work';
const base = 'http://localhost:9310';

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
        node.id === 'google_translate_element') return '';
    const attrs = [...node.attributes]
      .filter((a) => {
        if (a.name === 'style' || a.name === 'class') return false;
        if (tag === 'canvas' && (a.name === 'width' || a.name === 'height')) return false;
        if (a.name.startsWith('data-void') || a.name.startsWith('data-reactroot')) return false;
        // gradient id sinh runtime (useId) — khác nhau là hệ quả, không phải nguyên nhân
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

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

await page.route('**/_next/static/chunks/**', (r) => r.abort());
await page.goto(base + route, { waitUntil: 'domcontentloaded' });
const ssr = await page.evaluate(NORMALIZE);
await page.unroute('**/_next/static/chunks/**');

await page.goto(base + route, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
const client = await page.evaluate(NORMALIZE);

writeFileSync('tmp_ssr_tree.txt', ssr);
writeFileSync('tmp_client_tree.txt', client);

// So từng "element" (theo dấu '<' bắt đầu) để tìm khối khác nhau
const split = (s) => s.split(/(?=<)/).filter(Boolean);
const a = split(ssr);
const b = split(client);
let i = 0, j = 0;
while (i < a.length && j < b.length) {
  if (a[i] === b[j]) { i++; j++; continue; }
  // lệch: in context
  console.log('--- lệch tại phần tử', i, '/', j);
  console.log('SSR   :', a.slice(i, i + 6).join('\n        ').slice(0, 1400));
  console.log('CLIENT:', b.slice(j, j + 6).join('\n        ').slice(0, 1400));
  break;
}
if (i >= a.length || j >= b.length) {
  console.log('hết chuỗi: ssr còn', a.length - i, 'client còn', b.length - j);
  console.log('SSR   :', a.slice(i, i + 6).join('').slice(0, 900));
  console.log('CLIENT:', b.slice(j, j + 6).join('').slice(0, 900));
}
console.log('\nerrors:', errors.filter((e) => /418|hydrat/i.test(e)).join('\n') || 'không có lỗi hydration');
await browser.close();
