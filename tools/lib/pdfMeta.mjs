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

/** Mốc thời gian cố định cho metadata PDF. */
const FIXED_DATE = "D:20260101000000+00'00'";

/**
 * Cắt/pad một chuỗi về đúng độ dài mong muốn.
 * PDF date luôn có dạng `D:YYYYMMDDHHmmSS+HH'mm'` nên độ dài là cố định, nhưng
 * để chắc chắn ta vẫn giữ đúng độ dài chuỗi gốc thay vì hy vọng.
 */
function fitLength(text, len) {
  if (text.length === len) return text;
  if (text.length > len) return text.slice(0, len);
  return text + '0'.repeat(len - text.length);
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
        // giữ nguyên phần "/Key (" và ")" quanh giá trị
        const inner = /\((D:[^)]*)\)/.exec(match);
        if (!inner) return match;
        const fixed = fitLength(FIXED_DATE, inner[1].length);
        return match.replace(inner[1], fixed);
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
