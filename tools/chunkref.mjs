import fs from 'fs';
const file = process.argv[2];
const html = fs.readFileSync(file, 'utf8');

// Tên chunk trong HTML: /_next/static/chunks/xxx.js
// Tên chunk trong flight payload: /_next/static/chunks/xxx.js (đã escape)
const re = /_next\\?\/static\\?\/chunks\\?\/([^"'\\)\s]+)/g;
const set = new Set();
let m;
while ((m = re.exec(html))) set.add(m[1]);
console.log(file);
for (const s of [...set].sort()) console.log('  ', s);
