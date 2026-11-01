/**
 * Pipeline dựng lại site tĩnh từ bản gốc.
 *
 * Thứ tự rất quan trọng:
 *   1. reset chunk về bản gốc        — để mỗi lần chạy cho kết quả giống nhau
 *   2. rebrand.mjs                   — sinh lại HTML từ site.orig.bak + sửa nội dung chunk
 *   3. patchCredLink.mjs             — đổi thẻ chứng chỉ sang link verify (client bundle)
 *   4. renameChunks.mjs              — đổi tên chunk đã sửa (bust cache) + cập nhật tham chiếu
 *   5. pruneChunks.mjs               — xoá chunk cũ đã không còn ai tham chiếu
 *
 * Bước 6-7 là bắt buộc: tên chunk của Next.js là hash nội dung, nên sau khi sửa
 * nội dung, tên cũ không còn đúng. Trình duyệt cache theo tên với
 * `Cache-Control: max-age=600`, nên giữ tên cũ sẽ khiến người dùng nhận JS/CSS
 * cũ và gặp hydration mismatch (React error #418) hoặc thấy layout cũ.
 *
 * `renameChunks.mjs` đặt lại tên file theo hash nội dung (content-hash), nên
 * mỗi lần deploy đều sinh URL mới => trình duyệt không bao giờ dùng nhầm bản
 * cache cũ. Đây là cách bust cache duy nhất khả dụng trên GitHub Pages, vì
 * nền tảng này không cho override `Cache-Control`.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, cpSync, rmSync, readdirSync } from 'node:fs';

const step = (name, fn) => {
  console.log('\n=== ' + name + ' ===');
  fn();
};

const run = (script) =>
  execFileSync('node', ['tools/' + script], { stdio: 'inherit' });

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
  const src = 'site.orig.bak/_next/static/chunks';
  const dst = 'site/_next/static/chunks';
  if (!existsSync(src)) throw new Error('không thấy ' + src);
  mkdirSync(dst, { recursive: true });
  // Xoá hẳn rồi copy lại: ghi đè file đang bị handle mở (Windows) hay báo lỗi.
  for (const f of readdirSync(dst)) rmSync(dst + '/' + f);
  cpSync(src, dst, { recursive: true, force: true });
  console.log('đã khôi phục chunk gốc');
});

step('2/9 rebrand (HTML + DOM + flight + chunk)', () => run('rebrand.mjs'));
step('3/9 patch credential link (client bundle)', () => run('patchCredLink.mjs'));
step('4/9 đồng bộ icon map client', () => run('synciconmap.mjs'));
step('5/9 vá CSS (mất chữ trên desktop + thẻ ảnh chân dung)', () => run('patchCss.mjs'));
step('6/8 đổi tên chunk theo hash nội dung', () => run('renameChunks.mjs'));
step('7/8 dọn thế hệ chunk cũ', () => run('pruneChunks.mjs'));
step('8/8 kiểm tra tham chiếu', () => run('refcheck.mjs'));
step('9/8 sinh CV PDF', () => run('buildCv.mjs'));

console.log('\nHoàn tất. Chạy lại server:');
console.log('  java -jar build/libs/portfolio-kt.jar --port=9310 --root=site');
