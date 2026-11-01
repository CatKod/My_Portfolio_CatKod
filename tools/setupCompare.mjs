/**
 * So sánh chồng chữ giữa bản deploy TRƯỚC và SAU bản vá, trên tất cả route.
 *
 * Bản "trước" = commit 3e9953e^ của repo Pages (giai đoạn 7aedbaa).
 * Bản "sau"  = commit HEAD (hiện tại).
 *
 * Cả hai được phục vụ bằng hai static server cục bộ trên cổng khác nhau,
 * nên không phụ thuộc cache CDN của GitHub Pages.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { rmSync, existsSync, mkdirSync } from 'node:fs';

const PAGES = 'D:/GitHub/CatKod.github.io.pages';
const BEFORE_DIR = 'D:/GitHub/My_Portfolio_CatKod/.tmp-before';
const AFTER_DIR = 'D:/GitHub/My_Portfolio_CatKod/.tmp-after';

// Lấy bản trước từ git
if (existsSync(BEFORE_DIR)) rmSync(BEFORE_DIR, { recursive: true, force: true });
mkdirSync(BEFORE_DIR, { recursive: true });
execFileSync('git', ['worktree', 'add', '--detach', BEFORE_DIR, '7aedbaa'], {
  cwd: PAGES,
  stdio: 'inherit',
});

// Lấy bản sau (HEAD)
if (existsSync(AFTER_DIR)) rmSync(AFTER_DIR, { recursive: true, force: true });
mkdirSync(AFTER_DIR, { recursive: true });
execFileSync('git', ['worktree', 'add', '--detach', AFTER_DIR, 'HEAD'], {
  cwd: PAGES,
  stdio: 'inherit',
});

console.log('\nbefore ->', BEFORE_DIR);
console.log('after  ->', AFTER_DIR);
