/**
 * Tải lại bản site gốc (upstream) — input bắt buộc của bước 1 build.
 *
 * `site.orig.bak/` bị .gitignore (4.4 MB, 52 file) nên clone repo mới KHÔNG
 * build được. Script này tải lại đúng bộ file đó từ upstream theo manifest
 * (`tools/config/origin-manifest.json`), rồi kiểm tra kích thước từng file.
 *
 *   node tools/bootstrap.mjs
 *
 * Upstream: https://irfansabrian.vercel.app (bản Next.js tĩnh mà site này
 * được rebrand từ đó). Override được bằng:
 *   CATKOD_ORIGIN_URL=https://... node tools/bootstrap.mjs
 */
import { existsSync, mkdirSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { ORIG_DIR } from './config/paths.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ORIG = ORIG_DIR;

const manifest = JSON.parse(
  await import('node:fs').then((fs) => fs.readFileSync(path.join(HERE, 'config', 'origin-manifest.json'), 'utf8')),
);

const UPSTREAM = process.env.CATKOD_ORIGIN_URL ?? manifest.upstream;

/** Tải một file từ upstream, trả về Buffer hoặc null nếu lỗi. */
async function download(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

console.log('=== bootstrap: tải bản site gốc ===');
console.log('upstream: ' + UPSTREAM);
console.log('file:     ' + manifest.files.length);

if (existsSync(ORIG)) {
  console.log('\nsite.orig.bak đã tồn tại — xoá để tải lại cho sạch.');
  rmSync(ORIG, { recursive: true, force: true });
}
mkdirSync(ORIG, { recursive: true });

let ok = 0;
const failed = [];

for (const f of manifest.files) {
  // Route không đuôi (about, work, ...) là file HTML tĩnh phục vụ trực tiếp.
  // `index.html` thì upstream phục vụ ở root `/`.
  const url = UPSTREAM + (f.path === 'index.html' ? '/' : '/' + f.path);
  let buf = null;
  try {
    buf = await download(url);
  } catch (e) {
    failed.push(f.path + ' (' + e.message + ')');
    continue;
  }
  if (!buf) {
    failed.push(f.path + ' (HTTP error)');
    continue;
  }
  const dest = path.join(ORIG, f.path);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, buf);
  ok++;
  const size = statSync(dest).size;
  const warn = f.bytes && Math.abs(size - f.bytes) > f.bytes * 0.05 ? '  <- khác manifest' : '';
  console.log('  ✓ ' + f.path.padEnd(60) + String(size).padStart(8) + warn);
}

console.log('\ntải được ' + ok + '/' + manifest.files.length + ' file');
if (failed.length) {
  console.log('\nTHẤT BẠI:');
  for (const f of failed) console.log('  ✗ ' + f);
  console.log('\nUpstream có thể đã đổi layout. Cần cập nhật tools/config/origin-manifest.json.');
  process.exitCode = 1;
} else {
  console.log('\nXong. Giờ chạy: node tools/build/buildSite.mjs');
}
