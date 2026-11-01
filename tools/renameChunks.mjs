/**
 * Đổi tên chunk theo HASH NỘI DUNG và cập nhật mọi tham chiếu tới chúng.
 *
 * ============================================================================
 * VÌ SAO CẦN
 * ============================================================================
 * Next.js đặt tên chunk theo hash của build gốc (vd `15nsyxl.8hl16.js`). Sau
 * khi ta sửa nội dung chunk (rebrand, vá CSS), hash trong tên không còn đúng.
 * Bản vá trước chỉ thêm hậu tố tĩnh `.catkod` — tên file KHÔNG đổi giữa các
 * lần deploy, nên trình duyệt vẫn dùng bản cache cũ.
 *
 * Hậu quả đã gặp thật: người dùng mở trang /credentials bằng trình duyệt
 * thật vẫn thấy tiêu đề chứng chỉ bị mất chữ. Đo thực tế trên trang live
 * cho thấy đúng triệu chứng đó khi nạp CSS bản cũ:
 *   - tiêu đề  : height 25px  =>  0px  (biến mất hoàn toàn)
 *   - thumbnail: height 82px  =>  43px (bị ép dẹp)
 *
 * GitHub Pages không cho override `Cache-Control` (HTML luôn bị gán cứng
 * `max-age=600`), nên cách duy nhất để bust cache là ĐỔI TÊN FILE theo nội
 * dung — giống cách Next.js/Vercel làm với asset có content-hash.
 *
 * ============================================================================
 * VÌ SAO GIỮ LẠI THẾ HỆ CŨ (không xoá file)
 * ============================================================================
 * HTML cũ đã nằm trong cache của người dùng vẫn tham chiếu tên file cũ.
 * Nếu xoá file cũ ngay khi deploy, người dùng đó sẽ nhận 404 cho CSS/JS và
 * trang hiển thị KHÔNG CÓ STYLE — tệ hơn nhiều so với thấy bản cũ.
 *
 * Nên: file mới được tạo với tên mới (URL mới => bust cache), file cũ được
 * GIỮ NGUYÊN tên và nội dung (URL cũ vẫn tải được => trang vẫn render).
 * Đây đúng là cách Next.js/Vercel làm với asset có content-hash: file cũ vẫn
 * nằm trên CDN.
 *
 * Dọn rác được đảm bảo bằng `pruneChunks.mjs`: chỉ xoá file thuộc thế hệ cũ
 * hơn thế hệ trước, tức là sau khi mọi trình duyệt đã hết cache HTML cũ.
 *
 * ============================================================================
 * THUẬT TOÁN
 * ============================================================================
 * Tên mới:  <stem>.catkod.<hash8>.<ext>    vd 0kv4a-p~1zj9b.catkod.1bb0b6dd.css
 *
 * Vấn đề: hash của chunk X phụ thuộc vào tên mới của các chunk mà X tham
 * chiếu (vì tham chiếu nằm trong nội dung của X). Tính hash một lượt theo
 * thứ tự file sẽ dùng tên cũ trong nội dung => hash sai.
 *
 * Giải pháp: sắp xếp TOPOLOGICAL theo đồ thị phụ thuộc, xử lý dependency
 * trước. Đồ thị đã kiểm tra là không có chu trình (tools/preflight.mjs).
 *
 *   1. Chuẩn hoá tên (gỡ hậu tố .catkod / .catkod.<hash> nếu chạy lại).
 *   2. So với site.orig.bak để biết chunk nào thực sự nội dung đã đổi.
 *   3. Dựng đồ thị phụ thuộc (tham chiếu dạng literal).
 *   4. Tập cần đổi tên = {đổi nội dung} ∪ {chunk tham chiếu chúng (truyền)}.
 *   5. DFS hậu tố (post-order) => dependency luôn được xử lý trước.
 *   6. Với mỗi chunk: viết lại tham chiếu tới dependency (đã có tên mới),
 *      tính hash nội dung CUỐI CÙNG, đặt tên mới.
 *   7. Ghi file mới; GIỮ file cũ (xem mục "VÌ SAO GIỮ LẠI THẾ HỆ CŨ").
 *   8. Cập nhật tham chiếu trong mọi file của site/ (HTML + chunk + css).
 */
import { readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const chunkDir = 'site/_next/static/chunks';
const origDir = 'site.orig.bak/_next/static/chunks';
const HASH_LEN = 8;

/** Hậu tố đánh dấu: `.catkod` hoặc `.catkod.<hash8>` trước phần mở rộng. */
const MARK_RE = /^(.*)\.catkod(?:\.[0-9a-f]{8})?(\.(?:js|css))$/;

const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, HASH_LEN);

/** Tên gốc (bỏ hậu tố đánh dấu). */
const baseName = (f) => {
  const m = MARK_RE.exec(f);
  return m ? m[1] + m[2] : f;
};

/** Tham chiếu tới chunk trong mọi dạng đã gặp. */
function rewriteRefs(text, map) {
  let out = text;
  for (const [from, to] of map) {
    if (from === to) continue;
    // dạng tương đối: "./name"
    out = out.split('"./' + from + '"').join('"./' + to + '"');
    out = out.split("'./" + from + "'").join("'./" + to + "'");
    // dạng tuyệt đối: "static/chunks/name" (khớp cả /_next/static/chunks/...)
    out = out.split('static/chunks/' + from).join('static/chunks/' + to);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. Chuẩn hoá tên: gỡ hậu tố đánh dấu để chạy lại được (idempotent)
//    File đã mang tên `.catkod.<hash>` từ lần build trước được đưa về tên gốc
//    để so sánh với site.orig.bak cho đúng.
// ---------------------------------------------------------------------------
const marked = readdirSync(chunkDir).filter((f) => MARK_RE.test(f));
for (const f of marked) {
  const p = join(chunkDir, f);
  const data = readFileSync(p);
  rmSync(p);
  const back = baseName(f);
  if (!existsSync(join(chunkDir, back))) writeFileSync(join(chunkDir, back), data);
}

const files = readdirSync(chunkDir).filter((f) => /\.(js|css)$/.test(f));
if (!files.length) {
  console.log('không có chunk nào trong ' + chunkDir);
  process.exit(0);
}

const content = new Map();
for (const f of files) content.set(f, readFileSync(join(chunkDir, f), 'utf8'));

// ---------------------------------------------------------------------------
// 2. Chunk nào thực sự đổi nội dung so với bản gốc?
// ---------------------------------------------------------------------------
const changed = new Set();
for (const f of files) {
  const origPath = join(origDir, f);
  if (!existsSync(origPath)) {
    // Không có bản gốc để so: coi như đổi để chắc chắn bust cache.
    changed.add(f);
    continue;
  }
  if (readFileSync(origPath, 'utf8') !== content.get(f)) changed.add(f);
}

// ---------------------------------------------------------------------------
// 3. Đồ thị phụ thuộc (tham chiếu dạng literal)
// ---------------------------------------------------------------------------
const deps = new Map();
for (const f of files) {
  const c = content.get(f);
  const set = new Set();
  for (const g of files) {
    if (g === f) continue;
    if (c.includes('static/chunks/' + g) || c.includes('"./' + g + '"') || c.includes("'./" + g + "'")) {
      set.add(g);
    }
  }
  deps.set(f, set);
}

// ---------------------------------------------------------------------------
// 4. Tập cần đổi tên: chunk đổi nội dung + chunk tham chiếu chúng (truyền)
// ---------------------------------------------------------------------------
const renameSet = new Set(changed);
let grew = true;
while (grew) {
  grew = false;
  for (const f of files) {
    if (renameSet.has(f)) continue;
    for (const d of deps.get(f)) {
      if (renameSet.has(d)) {
        renameSet.add(f);
        grew = true;
        break;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Thứ tự topological (dependency trước) trên tập cần đổi tên
// ---------------------------------------------------------------------------
const order = [];
const state = new Map(); // 1 = đang thăm, 2 = xong
let cycles = 0;
function visit(f) {
  if (state.get(f) === 2) return;
  if (state.get(f) === 1) {
    cycles++;
    return; // chu trình: bỏ qua cạnh này
  }
  state.set(f, 1);
  for (const d of deps.get(f)) if (renameSet.has(d)) visit(d);
  state.set(f, 2);
  order.push(f);
}
for (const f of files) if (renameSet.has(f)) visit(f);
if (cycles) console.log('cảnh báo: chu trình phụ thuộc (' + cycles + '), dùng thứ tự tuần tự');

// ---------------------------------------------------------------------------
// 6. Tính tên mới
// ---------------------------------------------------------------------------
const finalName = new Map(); // tên gốc -> tên mới
const finalContent = new Map(); // tên gốc -> nội dung cuối cùng

for (const f of order) {
  const depMap = new Map();
  for (const d of deps.get(f)) if (finalName.has(d)) depMap.set(d, finalName.get(d));

  const text = rewriteRefs(content.get(f), depMap);
  const hash = sha(text);
  const stem = f.replace(/\.(js|css)$/, '');
  const newName = stem + '.catkod.' + hash + f.slice(f.lastIndexOf('.'));

  finalName.set(f, newName);
  finalContent.set(f, text);
}

// Chunk KHÔNG đổi tên giữ nguyên tên và nội dung.
for (const f of files) {
  if (finalName.has(f)) continue;
  finalName.set(f, f);
  finalContent.set(f, content.get(f));
}

// ---------------------------------------------------------------------------
// 7. Ghi file mới. File cũ được GIỮ LẠI (xem mục "VÌ SAO GIỮ LẠI THẾ HỆ CŨ")
//    => HTML cũ trong cache vẫn tải được asset cũ, trang không bị vỡ.
// ---------------------------------------------------------------------------
const renamed = [];
for (const [old, neu] of finalName) {
  if (old === neu) continue;
  writeFileSync(join(chunkDir, neu), finalContent.get(old), 'utf8');
  renamed.push([old,neu]);
}

// File cũ KHÔNG bị xoá ở đây. `pruneChunks.mjs` sẽ dọn sau khi đủ thời gian.

// ---------------------------------------------------------------------------
// 8. Cập nhật tham chiếu toàn site
// ---------------------------------------------------------------------------
function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

let touched = 0;
for (const p of walk('site')) {
  if (p.startsWith(chunkDir)) continue;
  let src;
  try {
    src = readFileSync(p, 'utf8');
  } catch {
    continue;
  }
  const out = rewriteRefs(src, renamed);
  if (out !== src) {
    writeFileSync(p, out, 'utf8');
    touched++;
  }
}

// Chunk mới vừa ghi: áp lại map lên toàn bộ chunk để chắc chắn không sót.
for (const [, neu] of renamed) {
  const p = join(chunkDir, neu);
  if (!existsSync(p)) continue;
  const src = readFileSync(p, 'utf8');
  const out = rewriteRefs(src, renamed);
  if (out !== src) writeFileSync(p, out, 'utf8');
}

// ---------------------------------------------------------------------------
// 9. Ghi manifest thế hệ để pruneChunks biết file nào còn được giữ
// ---------------------------------------------------------------------------
const manifestPath = join(chunkDir, '.generations.json');
let generations = [];
try {
  generations = JSON.parse(readFileSync(manifestPath, 'utf8')).generations || [];
} catch {
  generations = [];
}
const currentGen = [...finalName.values()].sort();
generations = [currentGen, ...generations.filter((g) => g && g.length)].slice(0, 3);
writeFileSync(manifestPath, JSON.stringify({ generations }, null, 1));

// ---------------------------------------------------------------------------
// 10. Báo cáo
// ---------------------------------------------------------------------------
console.log(
  'chunk đổi nội dung: ' + changed.size + '/' + files.length +
  ' | đổi tên: ' + renamed.length,
);
for (const [from, to] of renamed) console.log('  ' + from + '  =>  ' + to);
console.log('đã cập nhật tham chiếu trong ' + touched + ' file');
console.log('giữ lại ' + generations.length + ' thế hệ chunk cho cache cũ');
