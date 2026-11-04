/**
 * Công cụ xử lý RSC Flight payload của Next.js App Router.
 *
 * Cấu trúc một file HTML tĩnh do Next.js export:
 *   <script>self.__next_f.push([1,"<id>:<payload>\n<id>:<payload>\n..."])</script>
 *
 * Mỗi dòng trong payload có dạng `<id>:<json>` hoặc `<id>:<module-ref>`.
 * Payload có thể chứa chuỗi `"` đã escape, nên ta phải làm việc trên
 * chuỗi đã decode (raw) và chỉ encode lại đúng một lần khi ghi ra.
 */

/** Tách HTML thành các part: DOM (raw) và flight (payload đã decode). */
export function splitFile(html) {
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    parts.push({ kind: 'raw', text: html.slice(last, m.index) });
    parts.push({ kind: 'flight', text: decodePayload(m[1]) });
    last = m.index + m[0].length;
  }
  parts.push({ kind: 'raw', text: html.slice(last) });
  return parts;
}

/** Gộp lại. Payload được encode đúng một lần. */
export function joinFile(parts) {
  return parts
    .map((p) =>
      p.kind === 'raw'
        ? p.text
        : 'self.__next_f.push([1,' + JSON.stringify(p.text) + '])',
    )
    .join('');
}

/** Decode payload đã escape JSON thành chuỗi thô. */
export function decodePayload(escaped) {
  return JSON.parse('"' + escaped + '"');
}

/* ------------------------------------------------------------------ */
/* Truy cập dòng flight                                                */
/* ------------------------------------------------------------------ */

/**
 * Tách payload thành các dòng. Dòng giữ nguyên dạng `id:body`.
 * `body` là JSON thô (chưa parse) hoặc module reference.
 */
export function splitLines(payload) {
  const out = [];
  for (const raw of payload.split('\n')) {
    if (raw === '') continue;
    const ci = raw.indexOf(':');
    if (ci < 0) {
      out.push({ id: null, body: raw, raw });
      continue;
    }
    out.push({ id: raw.slice(0, ci), body: raw.slice(ci + 1), raw });
  }
  return out;
}

/** Ghép lại các dòng thành payload, giữ nguyên newline cuối. */
export function joinLines(lines, trailingNewline = true) {
  const s = lines.map((l) => l.raw).join('\n');
  return trailingNewline ? s + '\n' : s;
}

/**
 * Duyệt các dòng flight trong toàn bộ file.
 * `fn(line, partIndex, lineIndex)` có thể trả về:
 *   - undefined: giữ nguyên
 *   - string: thay thế toàn bộ dòng
 *   - object: { id, body } để thay id/body
 */
export function mapLines(parts, fn) {
  const out = [];
  parts.forEach((p, pi) => {
    if (p.kind !== 'flight') {
      out.push(p);
      return;
    }
    const lines = splitLines(p.text);
    const trailing = p.text.endsWith('\n');
    const mapped = lines.map((l, li) => {
      const r = fn(l, pi, li);
      if (r === undefined) return l;
      if (typeof r === 'string') return { id: l.id, body: r, raw: r };
      return { id: r.id ?? l.id, body: r.body, raw: `${r.id ?? l.id}:${r.body}` };
    });
    out.push({ kind: 'flight', text: joinLines(mapped, trailing) });
  });
  return out;
}

/**
 * Tìm & thay thế trong mọi dòng flight (chuỗi thô, không escape).
 */
export function replaceInFlight(parts, pairs) {
  return parts.map((p) => {
    if (p.kind !== 'flight') return p;
    let t = p.text;
    for (const [from, to] of pairs) {
      if (from) t = t.split(from).join(to);
    }
    return { ...p, text: t };
  });
}

/**
 * Tìm vị trí một mảng JSON cân bằng bắt đầu tại `key":[`.
 * Trả về { start, end } (end là vị trí sau `]`), hoặc null.
 */
export function findArraySpan(text, key) {
  const i = text.indexOf(key);
  if (i < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  let j = i + key.length - 1;
  for (; j < text.length; j++) {
    const ch = text[j];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
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
  return { start: i + key.length - 1, end: j };
}

/**
 * Thay mảng JSON tại `key":[...]` bằng mảng mới (đã stringify).
 */
export function replaceArray(text, key, newArray) {
  const span = findArraySpan(text, key);
  if (!span) return null;
  return text.slice(0, span.start) + JSON.stringify(newArray) + text.slice(span.end);
}

/**
 * Tìm node JSON có `className` khớp, trả về span của `children` của node đó.
 */
export function findChildrenSpan(text, className) {
  const key = `"className":"${className}","children":[`;
  const i = text.indexOf(key);
  if (i < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  let j = i + key.length - 1;
  for (; j < text.length; j++) {
    const ch = text[j];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
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
  return { start: i + key.length - 1, end: j };
}

/**
 * Thay `children` của node có `className` khớp.
 * `build(index)` trả về chuỗi JSON của mảng children mới.
 */
export function replaceFlightChildren(parts, className, build) {
  const out = [];
  parts.forEach((p) => {
    if (p.kind !== 'flight') {
      out.push(p);
      return;
    }
    let t = p.text;
    let from = 0;
    let count = 0;
    while (true) {
      const span = findChildrenSpan(t, className);
      if (!span || span.start < from) break;
      const newChildren = build(count);
      t = t.slice(0, span.start) + newChildren + t.slice(span.end);
      from = span.start + newChildren.length;
      count++;
    }
    out.push({ ...p, text: t });
  });
  return out;
}
