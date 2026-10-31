/**
 * Ghi file an toàn trên Windows.
 *
 * `writeFileSync` đôi khi báo `UNKNOWN: unknown error` khi file vừa được copy
 * (handle chưa đóng hoàn toàn) hoặc đang được một tiến trình khác giữ.
 * Cách chắc chắn hơn: ghi ra file tạm rồi `rename` đè lên — rename trên cùng
 * ổ đĩa là thao tác atomic và không cần mở file đích.
 */
import { writeFileSync, renameSync, unlinkSync, existsSync, readFileSync } from 'node:fs';

export function writeFileSafe(path, data) {
  const tmp = path + '.tmp';
  try {
    writeFileSync(tmp, data, 'utf8');
    renameSync(tmp, path);
    return;
  } catch {
    try { if (existsSync(tmp)) unlinkSync(tmp); } catch { /* bỏ qua */ }
  }

  // Dự phòng: thử lại ghi thẳng vài lần, thêm nhịp nghỉ giữa các lần thử.
  let last;
  for (let i = 0; i < 5; i++) {
    try {
      writeFileSync(path, data, 'utf8');
      return;
    } catch (e) {
      last = e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 120);
    }
  }
  throw last;
}

export function readFileSafe(path) {
  return readFileSync(path, 'utf8');
}
