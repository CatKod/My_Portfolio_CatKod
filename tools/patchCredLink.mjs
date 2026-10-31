/**
 * Đổi thẻ chứng chỉ từ "Preview PDF" (mở modal PDF.js) sang "Open credential"
 * (mở trang verify công khai) khi `record.href` là URL http(s).
 *
 * Bản gốc dùng modal PDF để xem file PDF local. Với Hoàng Kim Vĩnh không có
 * file PDF chứng chỉ (chỉ có link verify), nên card phải mở link ra ngoài.
 *
 * Sửa client bundle + DOM phải khớp nhau, nếu không React báo hydration
 * mismatch (error #418).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const dir = 'site/_next/static/chunks';
const files = readdirSync(dir).filter((f) => f.endsWith('.js'));

const OLD_HEAD =
  'function({record:e,variant:o="default"}){let[l,s]=(0,r.useState)(!1),d=(0,r.useCallback)(()=>s(!1),[]);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("button",{"aria-label":`Preview PDF: ${e.title}`,';

const NEW_HEAD =
  'function({record:e,variant:o="default"}){let[l,s]=(0,r.useState)(!1),d=(0,r.useCallback)(()=>s(!1),[]),m=/^https?:\\/\\//.test(e.href||"");return(0,t.jsxs)(t.Fragment,{children:[m?(0,t.jsx)("a",{"aria-label":`Open credential: ${e.title}`,className:`credential-preview-card ${"compact"===o?"credential-letter-card":"credential-certificate-card"}`,href:e.href,rel:"noreferrer",target:"_blank",children:[(0,t.jsxs)("div",{className:"credential-card-topline",children:[(0,t.jsx)("span",{children:e.code}),(0,t.jsxs)("small",{children:["Open credential",(0,t.jsx)(n,{size:12})]})]}),(0,t.jsx)("div",{className:"credential-thumb","aria-hidden":"true",children:(0,t.jsx)(i.default,{alt:"",fill:!0,loading:"lazy",sizes:"(max-width: 720px) 92vw, 22vw",src:e.image})}),(0,t.jsxs)("div",{className:"credential-card-copy",children:[(0,t.jsx)("span",{children:e.label}),(0,t.jsx)("strong",{children:e.title}),(0,t.jsx)("p",{children:e.issuer})]})]}):(0,t.jsxs)("button",{"aria-label":`Preview PDF: ${e.title}`,';

let patched = 0;
for (const file of files) {
  const path = dir + '/' + file;
  const src = readFileSync(path, 'utf8');
  if (!src.includes(OLD_HEAD)) continue;
  const out = src.split(OLD_HEAD).join(NEW_HEAD);
  writeFileSync(path, out, 'utf8');
  console.log('patched', file);
  patched++;
}
console.log('đã patch', patched, 'chunk');
