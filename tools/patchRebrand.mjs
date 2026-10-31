import { readFileSync, writeFileSync } from 'node:fs';

const f = 'tools/rebrand.mjs';
let t = readFileSync(f, 'utf8');

// 1) import hàm mới
t = t.replace(
  "import { COMMON } from './common.mjs';",
  "import { COMMON } from './common.mjs';\nimport { replaceNodeChildren } from './flightNode.mjs';",
);

// 2) thay toàn bộ định nghĩa replaceFlightChildren cũ bằng bản dùng flightNode
const oldFn = `/**
 * Thay \`children\` của một node trong flight có className khớp.
 * \`build(index)\` trả về chuỗi JSON của mảng children mới.
 */
function replaceFlightChildren(parts, className, build) {
  const key = \`"className":"\${className}","children":[\`;
  return parts.map((p) => {
    if (p.kind === 'raw') return p;
    let t = p.text;
    let from = 0;
    let count = 0;
    while (true) {
      const i = t.indexOf(key, from);
      if (i < 0) break;
      const span = spanOfArray(t, i + key.length - 1);
      const newChildren = build(count);
      t = t.slice(0, span.start) + newChildren + t.slice(span.end);
      from = span.start + newChildren.length;
      count++;
    }
    return { ...p, text: t };
  });
}`;

const newFn = `/**
 * Thay \`children\` của một node trong flight có className khớp.
 * \`build(index)\` trả về chuỗi JSON của mảng children mới.
 *
 * Dùng matcher của flightNode.mjs vì \`className\` không phải lúc nào cũng là
 * prop đầu tiên (ví dụ node \`credential-stat-grid\` có \`aria-label\` trước).
 */
function replaceFlightChildren(parts, className, build) {
  return replaceNodeChildren(parts, className, build);
}`;

if (!t.includes(oldFn)) {
  console.error('KHÔNG tìm thấy hàm replaceFlightChildren cũ');
  process.exit(1);
}
t = t.replace(oldFn, newFn);
writeFileSync(f, t, 'utf8');
console.log('ok');
