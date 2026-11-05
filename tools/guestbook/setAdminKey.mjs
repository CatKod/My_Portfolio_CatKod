/**
 * Ghi khoá admin của bảng tin khách vào Vercel Blob.
 *
 * Khoá nằm trong store `private` (không truy cập được từ bên ngoài) và được
 * so sánh thời gian hằng số ở server. Client đọc khoá từ `localStorage`
 * (`catkod-admin-key`) và gửi kèm header `x-admin-key`.
 *
 * Script này IDEMPOTENT: nếu file đã có khoá thì KHÔNG ghi đè, trừ khi truyền
 * `--force`.
 *
 * Cách chạy:
 *   cd guestbook-api && npm install
 *   BLOB_READ_WRITE_TOKEN=... node ../tools/guestbook/setAdminKey.mjs <khoá>
 *   BLOB_READ_WRITE_TOKEN=... node ../tools/guestbook/setAdminKey.mjs --force <khoá>
 */
import { get, put } from '@vercel/blob';

const ADMIN_KEY_PATH = 'admin-key.json';

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error('Thieu BLOB_READ_WRITE_TOKEN.');
  console.error(
    'Lay token o Vercel Dashboard -> Project catkod-guestbook-api -> Settings -> Environment Variables.',
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const key = args.find((a) => a !== '--force');

if (!key) {
  console.error('Thieu khoá admin.');
  console.error('Dung: node ../tools/guestbook/setAdminKey.mjs [--force] <khoá>');
  process.exit(1);
}

const existing = await get(ADMIN_KEY_PATH, { access: 'private' }).catch(() => null);
if (existing && !force) {
  const current = JSON.parse(await existing.stream.text()).key;
  console.log('Da co khoa admin trong store. dung --force de doi.');
  console.log('Khoa hien tai: ' + current);
  process.exit(0);
}

await put(ADMIN_KEY_PATH, JSON.stringify({ key }, null, 2), {
  access: 'private',
  contentType: 'application/json',
  addRandomSuffix: false,
  allowOverwrite: true,
  cacheControlMaxAge: 0,
});

console.log('Da ghi khoa admin vao store.');
