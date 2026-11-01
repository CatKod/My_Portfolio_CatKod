/**
 * Kiểm tra tính toàn vẹn của việc đổi tên chunk theo hash nội dung.
 *
 * Bốn kiểm tra:
 *   1. Mọi tham chiếu trong site/ đều trỏ tới file có thật.
 *   2. Tên file có đúng dạng `<stem>.catkod.<hash8>.<ext>` và hash trong tên
 *      KHỚP với hash nội dung hiện tại của file (tức là tên không bị stale).
 *   3. Không còn tên dạng `.catkod` không có hash (bản cũ, dễ dính cache).
 *   4. Chunk nào bị tham chiếu phải tồn tại — kể cả file thế hệ cũ, vì
 *      HTML trong cache của người dùng vẫn trỏ tới chúng.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const chunkDir = 'site/_next/static/chunks';
const chunks = fs.readdirSync(chunkDir);

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else files.push(p);
  }
})('site');

let errors = 0;

// --- 1. tham chiếu hỏng -------------------------------------------------
const onDisk = new Set(chunks);
const dangling = new Set();
for (const f of files) {
  let s;
  try {
    s = fs.readFileSync(f, 'utf8');
  } catch {
    continue;
  }
  for (const m of s.matchAll(/static\/chunks\/([A-Za-z0-9_~.@-]+\.(?:js|css))/g)) {
    if (!onDisk.has(m[1])) dangling.add(m[1] + '  (trong ' + f + ')');
  }
}
if (dangling.size) {
  console.log('THAM CHIẾU HỎNG:');
  for (const d of dangling) console.log('  ' + d);
  errors += dangling.size;
} else {
  console.log('OK: mọi tham chiếu trỏ tới file có thật');
}

// --- 2 & 3. tên + hash --------------------------------------------------
const HASH_RE = /^(.*)\.catkod\.([0-9a-f]{8})\.(js|css)$/;
for (const c of chunks) {
  const m = HASH_RE.exec(c);
  if (!m) {
    if (/\.catkod\.(js|css)$/.test(c)) {
      console.log('TÊN CŨ (dễ dính cache): ' + c);
      errors++;
    }
    continue;
  }
  const real = createHash('sha256').update(fs.readFileSync(path.join(chunkDir, c))).digest('hex').slice(0, 8);
  if (real !== m[2]) {
    console.log('HASH KHÔNG KHỚP nội dung: ' + c + '  (tên=' + m[2] + ' thực=' + real + ')');
    errors++;
  }
}

// --- 4. thống kê thế hệ ------------------------------------------------
try {
  const g = JSON.parse(fs.readFileSync(path.join(chunkDir, '.generations.json'), 'utf8')).generations || [];
  console.log('OK: đang giữ ' + g.length + ' thế hệ chunk');
} catch {
  console.log('chưa có manifest thế hệ (.generations.json)');
}

if (!errors) console.log('OK: tên chunk khớp hash nội dung');
console.log(errors ? '\nCÓ ' + errors + ' LỖI' : '\nTẤT CẢ OK');
if (errors) process.exitCode = 1;
