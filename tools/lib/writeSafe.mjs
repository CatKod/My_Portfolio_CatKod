/**
 * Đọc/ghi file an toàn trên Windows.
 *
 * `writeFileSync`/`readFileSync` đôi khi báo `UNKNOWN: unknown error` khi file
 * vừa được copy (handle chưa đóng hoàn toàn) hoặc đang được một tiến trình
 * khác giữ — hay gặp sau `cpSync` trong bước reset chunk.
 *
 * Cách chắc chắn hơn:
 *   - ghi: ghi ra file tạm rồi `rename` đè lên — rename trên cùng ổ đĩa là
 *     thao tác atomic và không cần mở file đích.
 *   - đọc: thử lại vài lần, mỗi lần chờ nhịp nghỉ ngắn.
 */
import { writeFileSync, renameSync, unlinkSync, existsSync, readFileSync } from 'node:fs';

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/** Số lần thử lại khi gặp lỗi tạm thời của hệ điều hành. */
const RETRIES = 8;
const RETRY_DELAY_MS = 150;

/** Lỗi này xảy ra khi handle của file vừa bị thay đổi chưa giải phóng xong. */
const isTransient = (e) =>
  e.code === 'UNKNOWN' ||
  e.code === 'EBUSY' ||
  e.code === 'EPERM' ||
  e.code === 'EACCES' ||
  e.code === 'ENOENT';

/**
 * Ghi file an toàn trên Windows.
 *
 * @param {string} path đường dẫn đích
 * @param {string|Buffer} data nội dung (string -> ghi utf8, Buffer -> ghi nguyên byte)
 */
export function writeFileSafe(path, data) {
  const isBuffer = Buffer.isBuffer(data);
  const tmp = path + '.tmp';
  try {
    writeFileSync(tmp, data, isBuffer ? undefined : 'utf8');
    renameSync(tmp, path);
    return;
  } catch {
    try { if (existsSync(tmp)) unlinkSync(tmp); } catch { /* bỏ qua */ }
  }

  // Dự phòng: thử lại ghi thẳng vài lần, thêm nhịp nghỉ giữa các lần thử.
  let last;
  for (let i = 0; i < RETRIES; i++) {
    try {
      writeFileSync(path, data, isBuffer ? undefined : 'utf8');
      return;
    } catch (e) {
      last = e;
      sleep(RETRY_DELAY_MS);
    }
  }
  throw last;
}

/**
 * Đọc file, tự thử lại khi gặp lỗi tạm thời (Windows giữ handle sau copy).
 * @param {string} path đường dẫn file
 * @param {string} [encoding] nếu bỏ trống thì trả về Buffer, nếu có thì trả về chuỗi
 */
export function readFileSafe(path, encoding) {
  let last;
  for (let i = 0; i < RETRIES; i++) {
    try {
      return encoding ? readFileSync(path, encoding) : readFileSync(path);
    } catch (e) {
      last = e;
      if (!isTransient(e)) throw e;
      sleep(RETRY_DELAY_MS);
    }
  }
  throw last;
}
