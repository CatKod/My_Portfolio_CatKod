/**
 * Chạy một script Node khác trong `tools/` như một tiến trình con.
 *
 * Dùng chung cho pipeline build và deploy để chỗ gọi script con luôn
 * giống nhau: tuyệt đối, cwd = repo root, kế thừa stdio.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { ROOT } from '../config/paths.mjs';

/**
 * @param {string} script  Đường dẫn script trong `tools/`, ví dụ `build/rebrand.mjs`
 * @param {string[]} args  Tham số truyền thêm
 */
export const runTool = (script, ...args) =>
  execFileSync('node', [path.join(ROOT, 'tools', script), ...args], {
    stdio: 'inherit',
    cwd: ROOT,
  });
