/**
 * Bảo đảm các file chunk "thế hệ cũ" (tên .catkod.<hash cũ>.css / .js) mà
 * trình duyệt đang cache HTML cũ vẫn trỏ tới cũng chứa NỘI DUNG ĐÃ VÁ.
 *
 * Vì sao cần:
 *   HTML đã cache trong trình duyệt vẫn tham chiếu file tên cũ
 *   (vd: 0kv4a-p~1zj9b.catkod.1bb0b6dd.css). Nếu file đó trên server chứa
 *   CSS cũ (chưa vá) thì người dùng vẫn thấy lỗi. Nếu xoá hẳn thì 404.
 *   => Ghi đè bằng CSS mới (đã vá) là giải pháp đúng cho cả hai trường hợp.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'site/_next/static/chunks';
const DST = 'D:/GitHub/CatKod.github.io.pages/_next/static/chunks';

const srcFiles = readdirSync(SRC).filter((f) => f.endsWith('.css') || f.endsWith('.js'));
const dstFiles = readdirSync(DST).filter((f) => f.endsWith('.css') || f.endsWith('.js'));

// file "gốc" của mỗi họ: tên không có .catkod.<hash>
const family = (name) => {
  const m = name.match(/^(.*?)(?:\.catkod\.[0-9a-f]{8})?(\.catkod)?(\.css|\.js)$/);
  return m ? m[1] + m[3] : name;
};

// nội dung mới nhất của mỗi họ, lấy từ site/ (đã vá)
const latest = new Map();
for (const f of srcFiles) {
  if (/\.catkod\.[0-9a-f]{8}\.(css|js)$/.test(f)) {
    const key = family(f);
    const p = join(SRC, f);
    const st = statSync(p);
    const cur = latest.get(key);
    if (!cur || st.mtimeMs > cur.mtimeMs) latest.set(key, { file: f, mtimeMs: st.mtimeMs, path: p });
  }
}

console.log('=== ghi de file the he cu bang noi dung da va ===');
let n = 0;
for (const f of dstFiles) {
  // chi xu ly file the he cu (co hash) khac file moi nhat
  if (!/\.catkod\.[0-9a-f]{8}\.(css|js)$/.test(f)) continue;
  const key = family(f);
  const src = latest.get(key);
  if (!src) {
    console.log('  (khong tim thay ban moi cho ' + key + ')');
    continue;
  }
  if (src.file === f) continue;
  const buf = readFileSync(src.path);
  writeFileSync(join(DST, f), buf);
  n++;
  console.log('  ' + f + '  <=  ' + src.file + '  (' + buf.length + ' bytes)');
}
console.log('  da ghi de ' + n + ' file');

console.log('\n=== kiem tra: noi dung CSS cu == CSS moi? ===');
const crypto = await import('node:crypto');
const sha = (p) => crypto.createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 8);
for (const f of dstFiles.filter((x) => x.endsWith('.css'))) {
  console.log('  ' + f.padEnd(42) + ' sha=' + sha(join(DST, f)));
}
