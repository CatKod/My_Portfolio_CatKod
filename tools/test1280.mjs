import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.route('**/*', r => /translate\.google/.test(r.request().url()) ? r.abort() : r.continue());
await page.goto('https://catkod.github.io/', { waitUntil: 'networkidle' });
console.log('Title:', await page.title());
const text = await page.evaluate(() => document.body.innerText);
console.log('Body innerText sample:\n', text.slice(0, 300));
await page.screenshot({ path: 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/test_1280.png' });
await browser.close();
