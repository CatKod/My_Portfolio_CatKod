/**
 * Bảo đảm các file chunk "thế hệ cũ" (tên .catkod.<hash cũ>.css / .js) mà
 * trình duyệt đang cache HTML cũ vẫn trỏ tới cũng chứa NỘI DUNG ĐÃ VÁ.
 *
 * Vì sao cần:
 *   HTML đã cache trong trình duyệt vẫn tham chiếu file tên cũ
 *   (vd: 0kv4a-p~1zj9b.catkod.1bb0b6dd.css). Nếu file đó trên server chứa
 *   CSS cũ (chưa vá) thì người dùng vẫn thấy lỗi. Nếu xoá hẳn thì 404.
 *   => Ghi đè bằng CSS mới (đã vá) là giải pháp đúng cho cả hai trường hợp.
 *
 * Nguồn nội dung mới: deploy/_next/static/chunks
 * Nguồn tên file cũ: git HEAD của repo Pages (lấy danh sách file trong lịch sử).
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const DEPLOY = 'deploy/_next/static/chunks';
const PAGES = 'D:/GitHub/CatKod.github.io.pages';
const DST = PAGES + '/_next/static/chunks';

const srcFiles = readdirSync(DEPLOY).filter((f) => f.endsWith('.css') || f.endsWith('.js'));
const dstFiles = readdirSync(DST).filter((f) => f.endsWith('.css') || f.endsWith('.js'));

// file "gốc" của mỗi họ: tên không có .catkod.<hash>
const family = (name) => {
  const m = name.match(/^(.*?)(?:\.catkod\.[0-9a-f]{8})?(\.catkod)?(\.css|\.js)$/);
  return m ? m[1] + m[3] : name;
};

// nội dung mới nhất của mỗi họ, lấy từ deploy/ (đã vá)
const latest = new Map();
for (const f of srcFiles) {
  if (/\.catkod\.[0-9a-f]{8}\.(css|js)$/.test(f)) {
    const key = family(f);
    const p = join(DEPLOY, f);
    const st = statSync(p);
    const cur = latest.get(key);
    if (!cur || st.mtimeMs > cur.mtimeMs) latest.set(key, { file: f, mtimeMs: st.mtimeMs, path: p });
  }
}

// các tên file thế hệ cũ đã từng được deploy: lấy từ lịch sử git của repo Pages
const oldNames = new Set();
try {
  const log = execFileSync('git', ['log', '--all', '--pretty=format:%H'], {
    cwd: PAGES,
    encoding: 'utf8',
  });
  const commits = log.split('\n').filter(Boolean).slice(0, 12);
  for (const c of commits) {
    const files = execFileSync('git', ['ls-tree', '-r', '--name-only', c, '_next/static/chunks'], {
      cwd: PAGES,
      encoding: 'utf8',
    })
      .split('\n')
      .filter((f) => f && /\.(css|js)$/.test(f));
    for (const f of files) {
      const name = f.split('/').pop();
      if (/\.catkod\.[0-9a-f]{8}\.(css|js)$/.test(name)) oldNames.add(name);
    }
  }
} catch (e) {
  console.log('  (khong doc duoc git log: ' + e.message.slice(0, 60) + ')');
}

console.log('=== ghi de file the he cu bang noi dung da va ===');
let n = 0;
for (const name of oldNames) {
  if (dstFiles.includes(name)) continue;
  const key = family(name);
  const src = latest.get(key);
  if (!src) {
    console.log('  (khong tim thay ban moi cho ' + key + ')');
    continue;
  }
  const buf = readFileSync(src.path);
  writeFileSync(join(DST, name), buf);
  n++;
  console.log('  ' + name + '  <=  ' + src.file + '  (' + buf.length + ' bytes)');
}
console.log('  da ghi de ' + n + ' file');

console.log('\n=== kiem tra: noi dung CSS cu == CSS moi? ===');
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 8);
for (const f of readdirSync(DST).filter((x) => x.endsWith('.css'))) {
  console.log('  ' + f.padEnd(42) + ' sha=' + sha(join(DST, f)));
}
