/**
 * Đồng bộ bản build trong site/ sang repo deploy GitHub Pages.
 *
 * Chiến lược:
 *  - Copy toàn bộ site/ sang repo deploy (xoá file cũ không còn dùng).
 *  - GIỮ LẠI 1 thế hệ chunk cũ (tên .catkod.<hash>.css / .js) để trình
 *    duyệt đang cache HTML cũ vẫn tải được asset (đã vá) thay vì 404.
 *  - File mới luôn có tên content-hash khác => cache bust tự nhiên.
 */
import {
  existsSync,
  mkdirSync,
  cpSync,
  rmSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const SRC = 'site';
const DST = 'D:/GitHub/CatKod.github.io.pages';

if (!existsSync(SRC)) throw new Error('khong thay ' + SRC);

console.log('=== xoa noi dung cu (giu .git, README.md) ===');
for (const entry of readdirSync(DST)) {
  if (entry === '.git' || entry === 'README.md') continue;
  rmSync(join(DST, entry), { recursive: true, force: true });
}

console.log('=== copy site/ sang repo deploy ===');
for (const entry of readdirSync(SRC)) {
  const s = join(SRC, entry);
  const d = join(DST, entry);
  if (statSync(s).isDirectory()) {
    cpSync(s, d, { recursive: true, force: true });
  } else {
    cpSync(s, d, { force: true });
  }
}

// .nojekyll: bat buoc cho GitHub Pages khong bo qua thu muc _next
if (!existsSync(join(DST, '.nojekyll'))) writeFileSync(join(DST, '.nojekyll'), '');

// ---- giu lai 1 the he chunk cu tu git HEAD ----
console.log('=== khoi phuc 1 the he chunk cu tu git HEAD ===');
const chunksDir = join(DST, '_next/static/chunks');
const current = readdirSync(chunksDir).filter((f) => f.endsWith('.css') || f.endsWith('.js'));

let restored = 0;
try {
  const oldFiles = execFileSync(
    'git',
    ['ls-tree', '-r', '--name-only', 'HEAD', '_next/static/chunks'],
    { cwd: DST, encoding: 'utf8' },
  )
    .split('\n')
    .filter((f) => f && /\.(css|js)$/.test(f));

  for (const f of oldFiles) {
    const name = f.split('/').pop();
    if (!/\.catkod\.[0-9a-f]{8}\.(css|js)$/.test(name)) continue;
    if (current.includes(name)) continue;
    const buf = execFileSync('git', ['show', 'HEAD:' + f], {
      cwd: DST,
      maxBuffer: 64 * 1024 * 1024,
    });
    writeFileSync(join(chunksDir, name), buf);
    restored++;
    console.log('  giu lai: ' + name);
  }
} catch (e) {
  console.log('  (khong doc duoc git HEAD: ' + e.message.slice(0, 60) + ')');
}
console.log('  da giu lai ' + restored + ' file chunk cu');

console.log('\n=== ket qua ===');
console.log(
  'css:\n     ' +
    readdirSync(chunksDir)
      .filter((f) => f.endsWith('.css'))
      .join('\n     '),
);
