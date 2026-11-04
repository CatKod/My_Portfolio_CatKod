/**
 * Chuẩn hoá metadata PDF để output có tính tất định (deterministic).
 *
 * Chrome headless ghi `/CreationDate` và `/ModDate` bằng thời điểm chạy, nên
 * mỗi lần build đều ra một file khác byte → git tree luôn bẩn, và không thể
 * so sánh "build có cho ra kết quả giống nhau" giữa hai lần chạy.
 *
 * Cách sửa: ghi đè hai chuỗi ngày bằng một mốc thời gian cố định, **giữ đúng
 * độ dài chuỗi gốc** nên toàn bộ byte offset (kể cả xref table) vẫn hợp lệ.
 *
 * Vì sao phải giữ độ dài?
 *   PDF ghi mọi đối tượng ở một byte offset cụ thể và bảng xref trỏ tới đúng
 *   offset đó. Nếu chuỗi bị ngắn/đài hơn, mọi offset phía sau dịch lệch và
 *   trình đọc PDF sẽ báo "file hỏng" hoặc hiển thị sai nội dung.
 */
import { readFileSync, writeFileSync } from 'node:fs';

/** Mốc thời gian cố định: 2026-01-01 00:00:00. */
const FIXED_STAMP = '20260101000000';

/**
 * Chuẩn hoá một giá trị date PDF về đúng độ dài ban đầu.
 *
 * PDF date có dạng `D:YYYYMMDDHHmmSS` + hậu tố múi giờ (`+00'00'`, `Z`, `+00`).
 * Ta chỉ thay **14 chữ số đầu** (phần ngày-giờ) và giữ nguyên hậu tố, nên:
 *   - độ dài không đổi → xref vẫn hợp lệ;
 *   - hậu tố múi giờ giữ nguyên → vẫn là date PDF hợp lệ.
 *
 * @param {string} raw giá trị gốc, ví dụ `D:20261104145127+00'00'`
 * @returns {string}
 */
export function fixPdfDate(raw) {
  const m = /^D:(\d{14})(.*)$/.exec(raw);
  if (m) return `D:${FIXED_STAMP}${m[2]}`;

  // Định dạng lạ (thiếu chữ số): thay tối đa 14 chữ số liên tiếp đầu tiên,
  // giữ nguyên phần còn lại và độ dài.
  let out = '';
  let digits = 0;
  for (const ch of raw) {
    if (digits < 14 && ch >= '0' && ch <= '9') {
      out += FIXED_STAMP[digits];
      digits++;
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * Ghi đè `/CreationDate` và `/ModDate` trong buffer PDF.
 * @param {Buffer} buf
 * @returns {Buffer}
 */
export function normalizePdfDates(buf) {
  let out = buf;
  for (const key of ['CreationDate', 'ModDate']) {
    const re = new RegExp(`/${key}\\s*\\(D:[^)]*\\)`, 'g');
    out = Buffer.from(
      out.toString('latin1').replace(re, (match) => {
        const inner = /\((D:[^)]*)\)/.exec(match);
        if (!inner) return match;
        return match.replace(inner[1], fixPdfDate(inner[1]));
      }),
      'latin1',
    );
  }
  return out;
}

/** Đọc file PDF và ghi lại bản đã chuẩn hoá metadata. */
export function normalizePdfFile(file) {
  const buf = normalizePdfDates(readFileSync(file));
  writeFileSync(file, buf);
  return buf.length;
}
