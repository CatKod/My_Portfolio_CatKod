/**
 * Liệt kê các tài nguyên (CSS/JS) mà trang chủ tham chiếu, kèm kiểm tra
 * nhanh xem tên còn sót "irfan" hay đã đổi sang "catkod".
 */
import { readFileSync } from 'node:fs';
import { SITE_DIR } from '../config/paths.mjs';
import path from 'node:path';

const f = readFileSync(path.join(SITE_DIR, 'index.html'), 'utf8');
console.log('CSS refs:', f.match(/href="[^"]*\.css[^"]*"/g));
console.log('irfan refs:', (f.match(/irfan[^"']*/g) || []).slice(0, 5));
console.log('catkod refs:', (f.match(/catkod[^"']*\.(css|js)/g) || []).slice(0, 5));
