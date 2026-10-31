/**
 * Đổi tên các chunk JS đã bị patch và cập nhật mọi tham chiếu tới chúng.
 *
 * Next.js đặt tên chunk theo hash nội dung, ví dụ `15nsyxl.8hl16.js`. Sau khi
 * ta sửa nội dung chunk, hash cũ không còn đúng, nhưng trình duyệt vẫn cache
 * theo tên và tiếp tục dùng bản cũ → hydration mismatch.
 *
 * Vì vậy: copy chunk đã đổi sang tên mới có hậu tố, rồi thay mọi tham chiếu
 * (trong HTML và trong chính các chunk khác) sang tên mới. File cũ vẫn giữ lại
 * để không phá vỡ tham chiếu nào sót lại.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'site/_next/static/chunks';
const files = readdirSync(dir).filter((f) => f.endsWith('.js'));
const origDir = 'site.orig.bak/_next/static/chunks';

// Chunk nào đã bị sửa so với bản gốc?
const changed = [];
for (const f of files) {
  const orig = join(origDir, f);
  if (!existsSync(orig)) continue;
  if (readFileSync(join(dir, f), 'utf8') !== readFileSync(orig, 'utf8')) changed.push(f);
}

if (!changed.length) {
  console.log('không có chunk nào bị sửa');
  process.exit(0);
}

console.log('chunk đã sửa:', changed.join(', '));

/** Tên mới: chèn hậu tố trước .js */
const newName = (f) => f.replace(/\.js$/, '.catkod.js');

// 1) Copy sang tên mới
const renames = new Map();
for (const f of changed) {
  const to = newName(f);
  copyFileSync(join(dir, f), join(dir, to));
  renames.set(f, to);
}

// 2) Thay tham chiếu trong mọi file của site (HTML + chunk + css)
function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const targets = [
  ...walk('site').filter((p) => !p.startsWith(join('site', '_next', 'static', 'chunks')) || p.endsWith('.css')),
  ...walk(join('site', '_next', 'static', 'chunks')),
];

let touched = 0;
for (const p of targets) {
  let src;
  try {
    src = readFileSync(p, 'utf8');
  } catch {
    continue;
  }
  let out = src;
  for (const [from, to] of renames) {
    out = out.split('/_next/static/chunks/' + from).join('/_next/static/chunks/' + to);
    // tham chiếu tương đối dạng ./15nsyxl.8hl16.js
    out = out.split('"./' + from + '"').join('"./' + to + '"');
    out = out.split("'./" + from + "'").join("'./" + to + "'");
  }
  if (out !== src) {
    writeFileSync(p, out, 'utf8');
    touched++;
    console.log('  ->', p);
  }
}
console.log('đã cập nhật', touched, 'file');
for (const [from, to] of renames) console.log(' ', from, '=>', to);
