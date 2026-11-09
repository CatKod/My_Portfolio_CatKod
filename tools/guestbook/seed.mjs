/**
 * Nạp 16 lời ghi tiếng Anh vào store thật của API (Vercel Blob).
 *
 * Vì sao cần bước này?
 *
 * Bản tĩnh của site (GitHub Pages) chứa 16 lời ghi trong HTML + flight
 * payload. Nhưng khi API bật, client sẽ gọi `GET /api/guestbook` và thay thế
 * danh sách trong bộ nhớ bằng kết quả từ API. Nếu store rỗng, người xem sẽ
 * thấy bảng tin trống — 16 lời ghi đó biến mất.
 *
 * Vì vậy: nạp 16 lời ghi vào Blob một lần, để API trả về đúng danh sách đó.
 * Sau đó lời ghi mới của khách sẽ được thêm vào cùng store đó.
 *
 * Thứ tự lưu:
 *   [lời ghi của khách, mới nhất trước] + [16 lời ghi gốc]
 *
 * Khớp với hành vi của API (`unshift` khi có lời ghi mới) và với bản tĩnh:
 * khi chưa có lời ghi nào của khách, thứ tự là đúng 16 lời ghi gốc.
 *
 * Script này IDEMPOTENT: chạy lại không làm mất lời ghi đã có, chỉ bổ sung
 * những lời ghi còn thiếu (khớp theo `id`). Lời ghi của khách (id do server
 * sinh ra) không bao giờ bị đụng tới.
 *
 * Cách chạy:
 *   cd guestbook-api && npm install
 *   BLOB_READ_WRITE_TOKEN=... node ../tools/guestbook/seed.mjs
 */
import { get, put } from '@vercel/blob';
import { guestbookMessages } from '../data/guestbook.mjs';
import { readBlobText } from '../lib/blobText.mjs';

const BLOB_PATH = 'guestbook.json';

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('Thieu BLOB_READ_WRITE_TOKEN.');
  console.error(
    'Lay token o Vercel Dashboard -> Project catkod-guestbook-api -> Settings -> Environment Variables.',
  );
  process.exit(1);
}

const blob = await get(BLOB_PATH, { access: 'private' }).catch(() => null);

let existing = [];
if (blob) {
  const parsed = JSON.parse(await readBlobText(blob));
  existing = Array.isArray(parsed?.messages) ? parsed.messages : [];
  console.log('store hien co ' + existing.length + ' loi ghi');
} else {
  console.log('store chua ton tai -> se tao moi');
}

const seedIds = new Set(guestbookMessages.map((m) => m.id));
const existingIds = new Set(existing.map((m) => m.id));

// Lời ghi của khách (id không nằm trong bộ seed) — giữ nguyên và đặt lên đầu.
const fromGuests = existing.filter((m) => !seedIds.has(m.id));
// Lời ghi gốc còn thiếu — bổ sung theo đúng thứ tự của bản tĩnh.
const missing = guestbookMessages.filter((m) => !existingIds.has(m.id));

if (missing.length === 0) {
  console.log('Khong thieu loi ghi nao. Khong can lam gi.');
} else {
  console.log('Bo sung ' + missing.length + ' loi ghi goc.');
}

const merged = [
  ...fromGuests,
  // Sắp xếp lại theo đúng thứ tự của bản tĩnh.
  // Lời ghi đã có trong store thì giữ nguyên bản (nơi đã có phần trả lời của
  // admin); lời ghi còn thiếu thì lấy từ bộ seed.
  ...guestbookMessages.map(
    (seed) => existing.find((m) => m.id === seed.id) ?? seed,
  ),
];

await put(
  BLOB_PATH,
  JSON.stringify({ updatedAt: new Date().toISOString(), messages: merged }, null, 2),
  {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  },
);

console.log('Da ghi store. Tong: ' + merged.length + ' loi ghi (' + fromGuests.length + ' cua khach).');
