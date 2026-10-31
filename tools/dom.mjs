/**
 * Tiện ích DOM tối giản cho HTML đã render sẵn của Next.js.
 * Không phụ thuộc thư viện ngoài: quét thẻ cân bằng bằng tay.
 */

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/** Trả về index của khoảng trắng trước thẻ mở chứa class. */
export function findByClass(html, className) {
  const re = new RegExp('class="([^"]*\\b' + className + '\\b[^"]*)"');
  const m = re.exec(html);
  if (!m) return -1;
  // lùi về đầu thẻ mở
  let i = m.index;
  while (i > 0 && html[i] !== '<') i--;
  return i;
}

/**
 * Trả về HTML của phần tử đầu tiên có class, cân bằng thẻ mở/đóng.
 */
export function elementByClass(html, className) {
  const start = findByClass(html, className);
  if (start < 0) return null;
  return balancedFrom(html, start);
}

/** Trả về mảng HTML của tất cả phần tử có class (không lồng nhau cùng class). */
export function elementsByClass(html, className) {
  const out = [];
  const re = new RegExp('class="([^"]*\\b' + className + '\\b[^"]*)"', 'g');
  let m;
  let searchFrom = 0;
  while ((m = re.exec(html)) !== null) {
    if (m.index < searchFrom) continue;
    let start = m.index;
    while (start > 0 && html[start] !== '<') start--;
    const el = balancedFrom(html, start);
    out.push(el);
    searchFrom = start + el.length;
    re.lastIndex = searchFrom;
  }
  return out;
}

/** Cân bằng thẻ từ vị trí mở thẻ, trả về chuỗi HTML kèm thẻ đóng. */
export function balancedFrom(html, start) {
  const open = /^<([a-zA-Z][a-zA-Z0-9-]*)/.exec(html.slice(start));
  if (!open) return html.slice(start);
  const tag = open[1];
  // thẻ rỗng tự đóng
  const gt = html.indexOf('>', start);
  const selfClosing = html[gt - 1] === '/';
  if (VOID_TAGS.has(tag.toLowerCase()) || selfClosing) {
    return html.slice(start, gt + 1);
  }
  let depth = 0;
  let i = start;
  const openRe = new RegExp('<' + tag + '(?=[\\s/>])', 'gi');
  const closeRe = new RegExp('</' + tag + '\\s*>', 'gi');
  // duyệt tuần tự bằng matcher tổng hợp
  const anyRe = new RegExp('<(/?)' + tag + '(?=[\\s/>])', 'gi');
  let mm;
  while ((mm = anyRe.exec(html)) !== null) {
    if (mm.index < start) continue;
    const isClose = mm[1] === '/';
    if (!isClose) {
      // kiểm tra tự đóng
      const g = html.indexOf('>', mm.index);
      const seg = html.slice(mm.index, g + 1);
      if (html[g - 1] !== '/' && !VOID_TAGS.has(tag.toLowerCase())) depth++;
      else {
        // thẻ tự đóng: không ảnh hưởng depth
      }
    } else {
      depth--;
      if (depth === 0) {
        // mm[0] là "</tag" (chưa gồm '>'), phải lấy tới hết dấu đóng thẻ
        const closeEnd = html.indexOf('>', mm.index);
        return html.slice(start, closeEnd + 1);
      }
    }
    i = mm.index;
  }
  return html.slice(start);
}

/** Thay thế chuỗi con đầu tiên. */
export function replaceOnce(html, needle, replacement) {
  const i = html.indexOf(needle);
  if (i < 0) return null;
  return html.slice(0, i) + replacement + html.slice(i + needle.length);
}

/** Thay thế tất cả. */
export function replaceAll(html, needle, replacement) {
  return html.split(needle).join(replacement);
}

/** Escape cho thuộc tính HTML. */
export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escape cho nội dung text node. */
export function escText(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
