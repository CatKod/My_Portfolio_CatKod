import { readFileSync, writeFileSync } from 'node:fs';

const f = 'tools/rebrand.mjs';
let t = readFileSync(f, 'utf8');

const oldBlock = `const ROUTES = {
  '/': 'site/index.html',
  '/about': 'site/about',
  '/work': 'site/work',
  '/skills': 'site/skills',
  '/credentials': 'site/credentials',
  '/guestbook': 'site/guestbook',
  '/contact': 'site/contact',
};`;

const newBlock = `/**
 * Mỗi route: đọc từ bản gốc (site.orig.bak) và ghi ra site/.
 * Luôn đọc từ bản gốc để script chạy lại nhiều lần cho kết quả giống nhau.
 */
const ROUTES = {
  '/': ['site.orig.bak/index.html', 'site/index.html'],
  '/about': ['site.orig.bak/about', 'site/about'],
  '/work': ['site.orig.bak/work', 'site/work'],
  '/skills': ['site.orig.bak/skills', 'site/skills'],
  '/credentials': ['site.orig.bak/credentials', 'site/credentials'],
  '/guestbook': ['site.orig.bak/guestbook', 'site/guestbook'],
  '/contact': ['site.orig.bak/contact', 'site/contact'],
};`;

if (!t.includes(oldBlock)) {
  console.error('không tìm thấy ROUTES');
  process.exit(1);
}
t = t.replace(oldBlock, newBlock);

const oldRun = `for (const [route, file] of Object.entries(ROUTES)) {
  const before = readFileSync(file, 'utf8').length;
  const parts = handlers[route](splitFile(readFileSync(file, 'utf8')));
  const out = joinFile(parts);
  writeFileSync(file, out, 'utf8');
  console.log(route.padEnd(13), before, '->', out.length);
}`;

const newRun = `for (const [route, [src, dst]] of Object.entries(ROUTES)) {
  const before = readFileSync(src, 'utf8').length;
  const parts = handlers[route](splitFile(readFileSync(src, 'utf8')));
  const out = joinFile(parts);
  writeFileSync(dst, out, 'utf8');
  console.log(route.padEnd(13), before, '->', out.length);
}`;

if (!t.includes(oldRun)) {
  console.error('không tìm thấy vòng chạy');
  process.exit(1);
}
t = t.replace(oldRun, newRun);

writeFileSync(f, t, 'utf8');
console.log('ok');
