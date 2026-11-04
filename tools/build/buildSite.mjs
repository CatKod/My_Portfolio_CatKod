/**
 * Pipeline dựng lại site tĩnh từ bản gốc.
 *
 * Thứ tự rất quan trọng:
 *   1. reset chunk về bản gốc        — để mỗi lần chạy cho kết quả giống nhau
 *   2. rebrand.mjs                   — sinh lại HTML từ site.orig.bak + sửa nội dung chunk
 *   3. patchCredLink.mjs             — đổi thẻ chứng chỉ sang link verify (client bundle)
 *   4. synciconmap.mjs              — đồng bộ icon map giữa tools và client bundle
 *   5. patchCss.mjs                 — vá lỗi layout do trình duyệt mới gây ra
 *   6. renameChunks.mjs             — đổi tên chunk đã sửa (bust cache) + cập nhật tham chiếu
 *   7. pruneChunks.mjs              — xoá chunk cũ đã không còn ai tham chiếu
 *   8. refcheck.mjs                 — kiểm tra mọi tham chiếu trong site/ còn hợp lệ
 *   9. buildCv.mjs                  — sinh CV PDF
 *
 * Bước 6-8 là bắt buộc: tên chunk của Next.js là hash nội dung, nên sau khi sửa
 * nội dung, tên cũ không còn đúng. Trình duyệt cache theo tên với
 * `Cache-Control: max-age=600`, nên giữ tên cũ sẽ khiến người dùng nhận JS/CSS
 * cũ và gặp hydration mismatch (React error #418) hoặc thấy layout cũ.
 *
 * `renameChunks.mjs` đặt lại tên file theo hash nội dung (content-hash), nên
 * mỗi lần deploy đều sinh URL mới => trình duyệt không bao giờ dùng nhầm bản
 * cache cũ. Đây là cách bust cache duy nhất khả dụng trên GitHub Pages, vì
 * nền tảng này không cho override `Cache-Control`.
 *
 * Mọi script được gọi bằng đường dẫn tuyệt đối (resolve từ `import.meta.url`),
 * nên `node tools/build/buildSite.mjs` chạy được từ bất kỳ thư mục nào.
 */
import { execFileSync } from 'node:child_process';
import { SITE_DIR, ORIG_DIR, CALENDAR_FILE } from '../config/paths.mjs';
import { existsSync, mkdirSync, cpSync, rmSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { runTool } from '../lib/exec.mjs';

const step = (name, fn) => {
  console.log('\n=== ' + name + ' ===');
  fn();
};

/** Chạy một script trong `tools/`, tìm theo đường dẫn tương đối từ `tools/`. */
const run = (script, ...args) => runTool(script, ...args);

step('0/9 dừng server đang chạy', () => {
  // Server giữ file trong site/ khiến Node không ghi lại được trên Windows.
  try {
    execFileSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        "Get-CimInstance Win32_Process -Filter \"Name='java.exe'\" | " +
          'Where-Object { $_.CommandLine -like "*portfolio-kt*" } | ' +
          'ForEach-Object { Stop-Process -Id $_.ProcessId -Force }',
      ],
      { stdio: 'inherit' },
    );
    console.log('đã dừng server');
  } catch {
    console.log('không có server nào chạy');
  }
});

step('1/9 reset chunk về bản gốc', () => {
  const src = path.join(ORIG_DIR, '_next', 'static', 'chunks');
  const dst = path.join(SITE_DIR, '_next', 'static', 'chunks');
  if (!existsSync(src)) {
    throw new Error(
      'không thấy bản site gốc tại ' + src + '\n' +
        'Chạy `node tools/bootstrap.mjs` để tải lại bản gốc trước khi build.',
    );
  }
  mkdirSync(dst, { recursive: true });
  // Xoá hẳn rồi copy lại: ghi đè file đang bị handle mở (Windows) hay báo lỗi.
  for (const f of readdirSync(dst)) rmSync(path.join(dst, f));
  cpSync(src, dst, { recursive: true, force: true });
  console.log('đã khôi phục chunk gốc');
});

step('2/9 rebrand (HTML + DOM + flight + chunk)', () =>
  run('build/rebrand.mjs', CALENDAR_FILE));
step('3/9 patch credential link (client bundle)', () => run('build/patchCredLink.mjs'));
step('4/9 đồng bộ icon map client', () => run('build/synciconmap.mjs'));
step('5/9 vá CSS (mất chữ trên desktop + thẻ ảnh chân dung)', () => run('build/patchCss.mjs'));
step('6/9 đổi tên chunk theo hash nội dung', () => run('build/renameChunks.mjs'));
step('7/9 dọn thế hệ chunk cũ', () => run('build/pruneChunks.mjs'));
step('8/9 kiểm tra tham chiếu', () => run('verify/refcheck.mjs'));
step('9/9 sinh CV PDF', () => run('cv/buildCv.mjs'));

console.log('\nHoàn tất. Chạy lại server:');
console.log('  java -jar build/libs/portfolio-kt.jar --port=9310 --root=site');
