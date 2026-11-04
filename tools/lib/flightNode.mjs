/**
 * Tìm & thay thế node JSON trong flight payload.
 *
 * Một node có dạng:
 *   ["$","div",null,{"className":"X","aria-label":"...","children":[...]}]
 *
 * `className` không nhất thiết là prop đầu tiên, nên ta tìm theo
 * `"className":"X"` rồi quét tới `"children":[` kế tiếp trong cùng object.
 */

/** Tìm span của mảng JSON cân bằng bắt đầu tại vị trí mở ngoặc. */
export function spanOfArray(text, open) {
  let depth = 0;
  let inStr = false;
  let escCh = false;
  let j = open;
  for (; j < text.length; j++) {
    const ch = text[j];
    if (inStr) {
      if (escCh) escCh = false;
      else if (ch === '\\') escCh = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) {
        j++;
        break;
      }
    }
  }
  if (depth !== 0) return null;
  return { start: open, end: j };
}

/**
 * Tìm `children` của node có `className` khớp, bắt đầu quét từ `from`.
 */
export function findNodeChildrenSpan(text, className, from = 0) {
  const marker = `"className":"${className}"`;
  let i = text.indexOf(marker, from);
  while (i >= 0) {
    const j = text.indexOf('"children":[', i);
    if (j < 0) return null;
    // không được vượt qua dấu `}` đóng object chứa className
    if (text.slice(i, j).includes('}')) return null;
    const span = spanOfArray(text, j + '"children":'.length);
    if (!span) return null;
    return span;
  }
  return null;
}

/**
 * Thay `children` của mọi node có `className` khớp.
 * `build(index)` trả về chuỗi JSON của mảng children mới.
 */
export function replaceNodeChildren(parts, className, build) {
  return parts.map((p) => {
    if (p.kind === 'raw') return p;
    let t = p.text;
    let from = 0;
    let count = 0;
    while (true) {
      const span = findNodeChildrenSpan(t, className, from);
      if (!span || span.start < from) break;
      const newChildren = build(count);
      t = t.slice(0, span.start) + newChildren + t.slice(span.end);
      from = span.start + newChildren.length;
      count++;
    }
    return { ...p, text: t };
  });
}
