/**
 * Tải các file media (font) mà CSS tham chiếu nhưng thiếu trong `site/`.
 *
 * Bản dựng `site/` được mirror từ site gốc nhưng không kéo theo toàn bộ file
 * trong `_next/static/media/`. CSS vẫn tham chiếu chúng, nên trình duyệt báo
 * 404 và fallback sang font hệ thống.
 */
import fs from 'fs';
import path from 'path';

const root = 'site';
const mediaDir = path.join(root, '_next/static/media');
const upstream = 'https://irfansabrian.vercel.app/_next/static/media';

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else files.push(p);
  }
})(root);

// CSS tham chiếu media tương đối: url(../media/NAME)
const re = /url\(\.\.\/media\/([^)'"]+)\)/g;
const refs = new Set();
for (const f of files) {
  if (!f.endsWith('.css')) continue;
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(re)) refs.add(m[1]);
}

console.log('media refs in CSS:', refs.size);

let downloaded = 0;
let missing = 0;
for (const name of refs) {
  const dest = path.join(mediaDir, name);
  if (fs.existsSync(dest)) continue;
  const res = await fetch(`${upstream}/${name}`);
  if (!res.ok) {
    console.log('  MISS ' + res.status + ' ' + name);
    missing++;
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log('  GET  ' + name + ' (' + buf.length + ' bytes)');
  downloaded++;
}

console.log('\ndownloaded ' + downloaded + ', missing ' + missing);
