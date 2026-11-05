/**
 * Cấu hình bảng tin khách (guestbook).
 *
 * Tách riêng khỏi code để đổi endpoint không phải sửa logic vá bundle.
 */

/**
 * URL gốc của API.
 *
 * Site tĩnh nằm ở `catkod.github.io` còn API ở Vercel nên khác origin —
 * client phải gọi URL TUYỆT ĐỐI, không phải đường dẫn tương đối.
 *
 * Đổi domain thì sửa ở đây, rồi chạy lại `npm run build` để vá lại bundle.
 */
export const guestbookApiOrigin = 'https://catkod-guestbook-api.vercel.app';

/** Đường dẫn API (client bundle tự thêm query string). */
export const guestbookApiPath = '/api/guestbook';

/** URL đầy đủ, dùng để ghi vào client bundle. */
export const guestbookApiUrl = guestbookApiOrigin + guestbookApiPath;

/**
 * Khoá trong `localStorage` chứa admin key.
 *
 * Chỉ dùng để gắn header `x-admin-key` khi gọi API. Đây là khoá của chính
 * chủ site — nó phải nằm ở client để người đó dùng được, nên coi nó như
 * "khoá trình duyệt" chứ không phải bí mật tuyệt đối. Server vẫn kiểm tra
 * khoá này trước mọi thao tác quản trị.
 */
export const guestbookAdminKeyStorage = 'catkod-admin-key';
