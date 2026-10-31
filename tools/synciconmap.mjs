/**
 * Đồng bộ icon map giữa client bundle (React) và tools/icons.mjs.
 *
 * Nếu một tên có trong map của tools nhưng vắng trong bundle React (hoặc khác
 * slug/variant), thì SSR DOM sẽ render <img> còn client render chữ viết tắt
 * (hoặc ngược lại) → React báo hydration mismatch (error #418).
 *
 * Script này patch map trong chunk JS cho khớp với tools/icons.mjs.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { ICON_MAP } from './icons.mjs';

const dir = 'site/_next/static/chunks';
const files = readdirSync(dir).filter((f) => f.endsWith('.js'));

let patched = 0;
for (const file of files) {
  const path = dir + '/' + file;
  const src = readFileSync(path, 'utf8');
  const start = src.indexOf('{"AI SDKs"');
  if (start < 0) continue;

  // Tìm phần cuối của object map (cân bằng ngoặc)
  let depth = 0;
  let inStr = false;
  let esc = false;
  let end = -1;
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; continue; }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  if (end < 0) continue;

  const raw = src.slice(start, end);
  const json = raw.replace(/([{,])\s*([A-Za-z][A-Za-z0-9 .+/#-]*)\s*:/g, '$1"$2":');
  const obj = JSON.parse(json);

  // Thêm/sửa entry cho khớp tools/icons.mjs
  const changes = [];
  for (const [name, meta] of Object.entries(ICON_MAP)) {
    const variant = meta.variant ? `,variant:"${meta.variant}"` : '';
    const entry = `{slug:"${meta.slug}"${variant}}`;
    const wanted = `${JSON.stringify(name).slice(1, -1)}`;
    const pattern = new RegExp(
      `(["']?)${wanted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1\\s*:\\s*\\{slug:"[a-z0-9-]+"(?:,variant:"[a-z]+")?\\}`,
    );
    if (!pattern.test(raw)) {
      changes.push(`${name}=>${entry}`);
      obj[name] = { slug: meta.slug, ...(meta.variant ? { variant: meta.variant } : {}) };
    }
  }

  if (!changes.length) continue;

  // Dựng lại object literal theo định dạng gốc (không quote key trừ khi cần)
  const keyNeedsQuote = (k) => !/^[A-Za-z][A-Za-z0-9]*$/.test(k);
  const body = Object.entries(obj)
    .map(([k, v]) => {
      const key = keyNeedsQuote(k) ? JSON.stringify(k) : k;
      const variant = v.variant ? `,variant:"${v.variant}"` : '';
      return `${key}:{slug:"${v.slug}"${variant}}`;
    })
    .join(',');

  const out = src.slice(0, start) + '{' + body + '}' + src.slice(end);
  writeFileSync(path, out, 'utf8');
  console.log(file, '-> thêm/sửa', changes.length, 'entry');
  for (const c of changes) console.log('   ', c);
  patched++;
}
console.log('đã patch', patched, 'chunk');
