/**
 * Xoá các chunk JS cũ đã bị thay thế bởi bản `.catkod.js`.
 *
 * Tên chunk của Next.js là hash nội dung, nên sau khi sửa nội dung, tên cũ
 * không còn đúng. Trình duyệt cache theo tên và `Cache-Control: immutable`,
 * nên nếu giữ lại tên cŝ, người dùng sẽ nhận bản JS cũ → hydration mismatch.
 *
 * File này chạy SAU `renameChunks.mjs` và chỉ xoá file cũ khi không còn file
 * nào trong `site/` tham chiếu tới nó.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'site/_next/static/chunks';
const newFiles = readdirSync(dir).filter((f) => f.endsWith('.catkod.js'));

const all = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else all.push(p);
  }
})('site');

for (const nf of newFiles) {
  const old = nf.replace('.catkod.js', '.js');
  const oldPath = join(dir, old);
  if (!existsSync(oldPath)) continue;

  let stillReferenced = false;
  for (const f of all) {
    if (f === oldPath) continue;
    let s;
    try { s = readFileSync(f, 'utf8'); } catch { continue; }
    if (s.includes('/_next/static/chunks/' + old) || s.includes('"./' + old + '"')) {
      stillReferenced = true;
      break;
    }
  }
  if (stillReferenced) {
    console.log('giữ lại (còn tham chiếu):', old);
    continue;
  }
  unlinkSync(oldPath);
  console.log('đã xoá:', old);
}
