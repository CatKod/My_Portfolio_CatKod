/**
 * Chuỗi cần thay trong client bundle để nút "Open CV" không mở modal PDF.js.
 *
 * Bản gốc (module 59900 trong chunk `0ocwl5hn2190n.js`):
 *
 *   e.s(["CvPreviewButton",0,function({cvPath:e}){let[a,o]=(0,r.useState)(!1),
 *   l=(0,r.useCallback)(()=>o(!1),[]);return(0,t.jsxs)(t.Fragment,{children:[
 *   (0,t.jsxs)("button",{className:"cv-preview-trigger",type:"button",
 *   onClick:()=>o(!0),children:["Open CV",...
 *
 * Ta đổi `onClick:()=>o(!0)` thành `onClick:()=>{window.dispatchEvent(
 * new CustomEvent("catkod:cv-open"))}`.
 *
 * Hệ quả CỐ Ý:
 *   - state `isOpen` của modal PDF.js không bao đổi => modal PDF.js không bao
 *     giờ mở (và không cần tải PDF.js nữa);
 *   - nút "Open CV" vẫn render y hệt bản gốc ở phía SSR => DOM tĩnh không
 *     đổi => KHÔNG có hydration mismatch (React error #418).
 *
 * Phần modal thật do `tools/client/cvViewer.js` đảm nhiệm — file vanilla JS
 * riêng, dễ đọc và dễ sửa, thay vì vá tay React đã minify.
 */

/** Đoạn cũ (đúng một lần trong chunk). */
export const OLD_CLICK = `onClick:()=>o(!0),children:["Open CV"`;

/** Đoạn mới. */
export const NEW_CLICK = `onClick:()=>{window.dispatchEvent(new CustomEvent("catkod:cv-open"))},children:["Open CV"`;

/**
 * CSS cho trình xem CV.
 *
 * Class `.cv-modal`, `.cv-modal-head`, `.cv-modal-actions`, `.cv-modal-frame`,
 * `.cv-modal-close` đã có sẵn từ modal PDF của bản gốc — ta dùng lại để
 * giữ đúng ngôn ngữ thị giác. Phần mới thêm: nút chuyển kiểu, badge ngôn ngữ,
 * nút tải PDF, và khung iframe co giãn theo bề rộng modal.
 */
export const CSS_PATCH =
  '.cv-viewer-backdrop{z-index:120}' +
  '.cv-viewer-modal{width:min(1000px,100%);height:min(90vh,880px)}' +
  '.cv-viewer-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}' +
  '.cv-viewer-toolbar{display:flex;align-items:center;gap:10px;margin-left:auto}' +
  '.cv-style-switch{display:inline-flex;border:1px solid var(--line);background:#ffffff47}' +
  '.cv-style-btn{appearance:none;border:0;border-right:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer;font-family:var(--font-mono), ui-monospace, monospace;text-transform:uppercase;font-size:.64rem;font-weight:760;letter-spacing:.06em;padding:8px 13px;line-height:1}' +
  '.cv-style-btn:last-child{border-right:0}' +
  '.cv-style-btn[aria-pressed="true"]{background:var(--ink);color:var(--paper)}' +
  '.cv-style-btn:hover:not([aria-pressed="true"]){background:#ffffff96}' +
  '.cv-lang-badge{border:1px solid var(--line);font-family:var(--font-mono), ui-monospace, monospace;font-size:.64rem;font-weight:760;letter-spacing:.08em;padding:8px 10px;line-height:1;color:var(--ink);background:#ffffff47}' +
  '.cv-viewer-frame{display:block;padding:12px;background:repeating-linear-gradient(135deg,#11111107 0 1px,transparent 1px 15px),var(--paper);overflow:auto}' +
  '.cv-viewer-stage{margin:0 auto}' +
  '.cv-viewer-doc{border:0;background:#fff;display:block;box-shadow:0 2px 20px #1110002e}' +
  '.cv-download-btn{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);padding:9px 14px;font-family:var(--font-mono), ui-monospace, monospace;text-transform:uppercase;font-size:.64rem;font-weight:760;letter-spacing:.06em;color:var(--ink);background:transparent;cursor:pointer;text-decoration:none}' +
  '.cv-download-btn:hover{background:#ffffff96}' +
  'body.cv-viewer-open{overflow:hidden}' +
  '@media (max-width:720px){.cv-viewer-modal{height:min(88vh,720px)}.cv-viewer-head{padding:12px}.cv-viewer-toolbar{margin-left:0;width:100%}}';

/**
 * Điểm chèn CSS.
 *
 * Chọn rule `.cv-modal-actions{...}` vì nó tồn tại ở đúng một file CSS và
 * nằm ở cuối nhóm rule của modal CV.
 */
export const CSS_MARKER = '.cv-modal-actions{border-top:1px solid var(--line);border-bottom:0;justify-content:flex-end}';
