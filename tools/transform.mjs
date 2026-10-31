import { readFileSync, writeFileSync } from 'node:fs';
import { elementByClass, elementsByClass, replaceAll, esc, escText } from './dom.mjs';
import { commonReplacements } from './replacements.mjs';

/** Tách HTML thành: phần trước flight, các flight push, phần sau. */
export function splitFlight(html) {
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    parts.push({ kind: 'raw', text: html.slice(last, m.index) });
    parts.push({ kind: 'flight', text: m[1] });
    last = m.index + m[0].length;
  }
  parts.push({ kind: 'raw', text: html.slice(last) });
  return parts;
}

/** Gộp lại sau khi sửa. */
export function joinFlight(parts) {
  return parts
    .map(p => (p.kind === 'raw' ? p.text : 'self.__next_f.push([1,' + JSON.stringify(p.text) + '])'))
    .join('');
}

/** Decode một payload flight (đã escape JSON) thành chuỗi thô. */
export function decodeFlight(escaped) {
  return JSON.parse('"' + escaped + '"');
}

/**
 * Sửa nội dung trong một file HTML:
 *  - phần DOM (render sẵn) dùng bảng thay thế chuỗi thẳng
 *  - phần flight dùng bảng thay thế trên chuỗi đã decode
 */
export function transformFile(file, extraTable = []) {
  const html = readFileSync(file, 'utf8');
  const parts = splitFlight(html);
  const table = [...commonReplacements, ...extraTable];
  const out = parts
    .map(p => {
      if (p.kind === 'raw') {
        let t = p.text;
        for (const [from, to] of table) t = replaceAll(t, from, to);
        return { ...p, text: t };
      }
      const decoded = decodeFlight(p.text);
      let t = decoded;
      for (const [from, to] of table) t = replaceAll(t, from, to);
      return { ...p, text: t };
    });
  const result = joinFlight(out);
  writeFileSync(file, result, 'utf8');
  return { before: html.length, after: result.length };
}

/** Thay thế nội dung của một phần tử theo class (chỉ trong DOM, không đụng flight). */
export function replaceElement(html, className, newHtml, opts = {}) {
  const { all = false } = opts;
  if (all) {
    let out = html;
    const els = elementsByClass(html, className);
    for (const el of els) out = out.replace(el, newHtml);
    return out;
  }
  const el = elementByClass(html, className);
  if (!el) return null;
  return html.replace(el, newHtml);
}

/** Thay thế nội dung text bên trong thẻ đầu tiên có class. */
export function replaceInnerText(html, className, newText) {
  const el = elementByClass(html, className);
  if (!el) return null;
  // thay text node đầu tiên bên trong
  const m = /^<[^>]*>([^<]*)/.exec(el);
  if (!m) return null;
  const inner = m[1];
  const replaced = el.replace(inner, escText(newText));
  return html.replace(el, replaced);
}
