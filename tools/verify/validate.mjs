/**
 * Kiểm tra tính toàn vẹn của RSC flight payload: so bản build với bản gốc.
 *
 * Vì sao so với bản gốc?
 *   Trong static export của Next.js, không phải mọi dòng định nghĩa flight đều
 *   nằm trong file HTML — các dòng còn lại được ghi riêng và client gọi qua
 *   `?_rsc=` lúc runtime. Vì vậy đếm `$L<id>` rồi đòi mọi id phải có trong
 *   HTML sẽ báo "dangling" giả.
 *
 *   Lỗi THẬT là: một dòng mà bản gốc có, bản build không còn, nhưng chỗ
 *   tham chiếu tới nó vẫn còn. Đó là dấu hiệu rebrand đã xoá nhầm component.
 *
 * Ba dạng giá trị trong flight:
 *   - JSON thuần      → server component
 *   - `I<id>,<json>`  → lazy client reference
 *   - `T<hex>,<hex>`  → text reference
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { SITE_DIR, ORIG_DIR } from '../config/paths.mjs';

const ROUTES = ['index.html', 'about', 'work', 'skills', 'credentials', 'guestbook', 'contact'];

/** Tách flight payload của một file HTML tĩnh. */
function readFlight(file) {
  const s = readFileSync(file, 'utf8');
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let flight = '';
  for (const m of s.matchAll(re)) flight += JSON.parse(m[1]);

  const defs = new Set();
  for (const line of flight.split('\n')) {
    const m = line.match(/^([0-9a-f]+):(.*)$/);
    if (!m) continue;
    defs.add(m[1]);
  }
  const refs = new Set();
  for (const m of flight.matchAll(/\$L([0-9a-f]+)/g)) refs.add(m[1]);
  return { defs, refs };
}

let totalErrors = 0;

for (const r of ROUTES) {
  const built = readFlight(path.join(SITE_DIR, r));
  const orig = readFlight(path.join(ORIG_DIR, r));

  // Row bị mất: có ở bản gốc, không có ở bản build.
  const lost = [...orig.defs].filter((id) => !built.defs.has(id));
  // Tham chiếu còn sót tới một row đã mất.
  const broken = [...built.refs].filter((id) => orig.defs.has(id) && !built.defs.has(id));

  totalErrors += broken.length;
  console.log(
    r.padEnd(12),
    'defs', built.defs.size,
    'refs', built.refs.size,
    lost.length ? 'lost rows: ' + lost.join(',') : 'lost rows: none',
    broken.length ? 'BROKEN REFS: ' + broken.join(',') : 'broken refs: none',
  );
}

console.log(totalErrors ? '\nCÓ ' + totalErrors + ' THAM CHIẾU HỎNG' : '\nTẤT CẢ OK');
if (totalErrors) process.exitCode = 1;
