/**
 * Vá client bundle của bảng tin khách để làm việc với API thật.
 *
 * ============================================================================
 * Sáu việc
 * ============================================================================
 *
 * 1. Đổi endpoint tương đối thành URL tuyệt đối.
 *
 *    Site tĩnh nằm ở `catkod.github.io`, API nằm ở `*.vercel.app` — khác
 *    origin. `fetch("/api/guestbook")` trên GitHub Pages sẽ trả 404 vì
 *    GitHub Pages không có API. Phải gọi URL tuyệt đối.
 *
 * 2. Bỏ Turnstile.
 *
 *    Sitekey `0x4AAAAAAEFOi6dIoiaKDT-S` thuộc tác giả upstream và chỉ hợp lệ
 *    với domain của họ — trên domain khác Turnstile trả lỗi `110200` và
 *    không bao giờ phát token, nên form không gửi được. Ta bỏ hẳn widget và
 *    thay bằng honeypot + rate limit ở server.
 *
 *    Quan trọng: bỏ widget ở client làm DOM đổi (thẻ `.turnstile-widget`
 *    biến mất), nên DOM tĩnh trong HTML cũng phải bỏ theo — nếu không React
 *    sẽ báo hydration mismatch.
 *
 * 3. Bỏ chặn "phải có CAPTCHA mới gửi được".
 *
 * 4. Gắn header `x-admin-key` khi có khoá admin trong `localStorage`.
 *
 * 5. Bật chế độ admin.
 *
 *    Bản gốc có sẵn UI admin (trả lời / xoá lời ghi) nhưng cờ `isAdmin` do
 *    server render là `false` và không có cách nào bật — upstream chỉ bật được
 *    khi deploy với biến môi trường admin key của họ.
 *
 *    Ta làm lại: đọc khoá từ `localStorage` trong `useEffect` (SAU khi
 *    hydrate) rồi bật UI admin. Vì đọc trong effect nên lần render đầu
 *    (dùng để hydrate) vẫn là `false`, khớp với DOM tĩnh — không có
 *    hydration mismatch.
 *
 * 6. Tải danh sách lời ghi từ API khi mở trang.
 *
 *    Bản gốc CHỈ gọi API khi cuộn tới cuối danh sách ("load more"). Nhưng site
 *    tĩnh nên lời ghi mới của khách sẽ không xuất hiện cho tới lần build lại
 *    kế tiếp — bản HTML trên GitHub Pages vẫn là bản cũ. Phải tải lại khi
 *    mount.
 *
 *    Nếu API lỗi hoặc trả rỗng thì GIỮ nguyên danh sách tĩnh — để site
 *    không bị mất nội dung khi backend có sự cố.
 *
 * ============================================================================
 * Vì sao vá tay chứ không viết lại component
 * ============================================================================
 *
 * Client bundle đã minify. Một lỗi cú pháp trong chunk làm HỎNG CẢ TRANG
 * (React không hydrate được, loader không tắt, mọi nút bị chặn). Nên mọi
 * thay đổi ở đây đều:
 *   - dùng chuỗi đích có định danh rõ ràng, kiểm tra số lần xuất hiện;
 *   - kiểm tra cú pháp bằng `vm.Script` TRƯỚC khi ghi;
 *   - báo lỗi và dừng build nếu bất kỳ mục nào không khớp.
 *
 * Tương tự `tools/build/patchCvModal.mjs`.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { readFileSafe, writeFileSafe } from '../lib/writeSafe.mjs';
import {
  guestbookApiUrl,
  guestbookAdminKeyStorage,
} from '../config/guestbook.mjs';

const countMatches = (text, needle) => {
  let n = 0;
  let i = 0;
  while ((i = text.indexOf(needle, i)) !== -1) {
    n++;
    i += needle.length;
  }
  return n;
};

/**
 * Kiểm tra cú pháp chunk sau khi vá.
 *
 * Bắt buộc: một lỗi cú pháp trong chunk làm hỏng trang nguyên.
 */
function assertValidSyntax(code, label) {
  try {
    new vm.Script(code, { filename: label });
  } catch (e) {
    throw new Error(
      'chunk sau khi vá có lỗi cú pháp: ' + e.message +
        '\n  -> vá CHƯA được ghi, site giữ nguyên bản hợp lệ.',
    );
  }
}

/* ------------------------------------------------------------------ */
/* Chuỗi gốc và chuỗi thay thế                                         */
/* ------------------------------------------------------------------ */

/**
 * `fetch(`/api/guestbook?limit=10&offset=${e}`)` — dùng template literal.
 *
 * Lưu ý: KHÔNG tách riêng mẫu `fetch("/api/guestbook"` cho POST, vì chuỗi đó
 * nằm BÊN TRONG hàm `k()` (hàm gọi API) — mà hàm `k()` đã được vá trọn vẹn ở
 * dưới. Nếu vá trước thì mẫu của hàm `k()` sẽ không còn khớp (chuỗi đã đổi),
 * và build dừng với lỗi "KHÔNG tìm thấy hàm gọi API".
 */
const OLD_FETCH_TPL = 'fetch(`/api/guestbook?limit=10&offset=${e}`)';
const NEW_FETCH_TPL = 'fetch(`' + guestbookApiUrl + '?limit=10&offset=${e}`)';

/**
 * Component Turnstile — bỏ hẳn khỏi bundle.
 *
 * Thay bằng một component trả về `null`. Giữ tên hàm `y` để không phải sửa
 * chỗ gọi `(0,t.jsx)(y,{onTokenChange:O},R)`.
 */
const OLD_TURNSTILE =
  'function y({onTokenChange:e}){let s=(0,d.useRef)(null);return(0,d.useEffect)(()=>{let t=!1,n=null,r=()=>{!t&&s.current&&window.turnstile&&(n=window.turnstile.render(s.current,{callback:t=>e(t),"error-callback":()=>e(null),"expired-callback":()=>e(null),sitekey:"0x4AAAAAAEFOi6dIoiaKDT-S",size:"flexible",theme:"light"}))},a=document.querySelector("script[data-turnstile-script]");if(window.turnstile)r();else if(a)a.addEventListener("load",r,{once:!0});else{let e=document.createElement("script");e.async=!0,e.dataset.turnstileScript="",e.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",e.addEventListener("load",r),document.head.appendChild(e)}return()=>{t=!0,n&&window.turnstile&&window.turnstile.remove(n)}},[e]),(0,t.jsx)("div",{className:"turnstile-widget",ref:s})}';

/** Component mới: không render gì. */
const NEW_TURNSTILE = 'function y(){return null}';

/**
 * Hàm gửi lời ghi — bỏ yêu cầu token CAPTCHA.
 *
 * Gốc:
 *   W=async e=>{if(e.preventDefault(),A)return;if(!z)return void P(x("captcha-required"));...
 *
 * Sau:
 *   W=async e=>{if(e.preventDefault(),A)return;...
 *
 * Không gửi `turnstileToken` nữa (server không cần).
 */
const OLD_SUBMIT =
  'W=async e=>{if(e.preventDefault(),A)return;if(!z)return void P(x("captcha-required"));let t=new FormData(e.currentTarget);M(!0);try{let e=await k({action:"create",message:v(t,"message"),name:v(t,"name"),turnstileToken:z??"",website:v(t,"website")});';

const NEW_SUBMIT =
  'W=async e=>{if(e.preventDefault(),A)return;let t=new FormData(e.currentTarget);M(!0);try{let e=await k({action:"create",message:v(t,"message"),name:v(t,"name"),website:v(t,"website")});';

/**
 * Hàm gọi API — gắn header admin key nếu có.
 *
 * Khoá đọc bằng cách bọc trong `try` vì `localStorage` có thể bị chặn
 * (chế độ riêng tư của một số trình duyệt) — lỗi ở đây không được làm hỏng
 * việc gửi lời ghi.
 */
const OLD_API_FN =
  'async function k(e){let t=await fetch("/api/guestbook",{body:JSON.stringify(e),headers:{"Content-Type":"application/json"},method:"POST"}),s=await t.json();';

const NEW_API_FN =
  'async function k(e){let a={};try{let t=localStorage.getItem("' +
  guestbookAdminKeyStorage +
  '");t&&(a["X-Admin-Key"]=t)}catch{}let t=await fetch("' +
  guestbookApiUrl +
  '",{body:JSON.stringify(e),headers:Object.assign({"Content-Type":"application/json"},a),method:"POST"}),s=await t.json();';

/**
 * Bật chế độ admin.
 *
 * Gốc:
 *   ...initialTotal:m,isAdmin:p}){let[f,w]=(0,d.useState)(e),...
 *
 * Sau:
 *   ...initialTotal:m,isAdmin:__adm}){let[p,__sp]=(0,d.useState)(!1);
 *   (0,d.useEffect)(()=>{try{__sp(!!localStorage.getItem("KEY"))}catch{}},[]);
 *   let[f,w]=(0,d.useState)(e),...
 *
 * Vì sao đọc trong `useEffect` chứ không đọc lúc khởi tạo?
 *
 * Nếu đọc lúc khởi tạo (`useState(!!localStorage.getItem(...))`), client sẽ
 * render khác với DOM tĩnh (server không có khoá admin) => React báo
 * hydration mismatch. Đọc trong effect thì lần render đầu khớp DOM tĩnh,
 * và UI admin chỉ xuất hiện sau khi hydrate xong.
 */
const OLD_PROPS =
  'initialTotal:m,isAdmin:p}){let[f,w]=(0,d.useState)(e)';

const NEW_PROPS =
  'initialTotal:m,isAdmin:__adm}){let[p,__sp]=(0,d.useState)(!1);' +
  '(0,d.useEffect)(()=>{try{__sp(!!localStorage.getItem("' +
  guestbookAdminKeyStorage +
  '"))}catch{}},[]);' +
  'let[f,w]=(0,d.useState)(e)';

/**
 * Tải danh sách lời ghi khi mở trang.
 *
 * Gốc:
 *   U=(0,d.useRef)(K);(0,d.useEffect)(()=>{U.current=K},[K]),
 *
 * Sau: thêm một effect gọi API và thay danh sách.
 *
 * Chỉ thay khi API trả về ít nhất một lời ghi — nếu API lỗi hoặc rỗng thì giữ
 * nguyên danh sách tĩnh, để site không mất nội dung khi backend có sự cố.
 */
const OLD_EFFECT = 'U=(0,d.useRef)(K);(0,d.useEffect)(()=>{U.current=K},[K]),';

const NEW_EFFECT =
  'U=(0,d.useRef)(K);(0,d.useEffect)(()=>{U.current=K},[K]),' +
  '(0,d.useEffect)(()=>{let __g=async()=>{try{' +
  'let __r=await fetch("' + guestbookApiUrl + '?limit=100&offset=0");' +
  'if(!__r.ok)return;let __j=await __r.json();' +
  'if(!__j||!Array.isArray(__j.messages)||!__j.messages.length)return;' +
  'w(__j.messages),S(__j.total),C(__j.replyCount),F(__j.messages.length<__j.total)' +
  '}catch{}};__g()},[]),';

/**
 * Thông báo giới thiệu — sửa cho đúng thực tế.
 *
 * Gốc: "Messages appear here after submission. I can reply from my own browser
 * after unlocking admin mode."
 */
const OLD_COPY =
  'Messages appear here after submission. I can reply from my own browser after unlocking admin mode.';

const NEW_COPY =
  'Messages appear here right after submission. I read every one of them, and I reply to the technical ones myself.';

/* ------------------------------------------------------------------ */
/* Vá                                                                   */
/* ------------------------------------------------------------------ */

/**
 * Vá các chunk JS của bảng tin khách.
 *
 * @param {string} dir  thư mục chứa chunk
 * @returns {{patchedFiles: number, problems: string[]}}
 */
export function patchGuestbookChunks(dir) {
  const jsFiles = readdirSync(dir).filter((f) => f.endsWith('.js')).sort();
  let patchedFiles = 0;
  const problems = [];

  for (const file of jsFiles) {
    const p = join(dir, file);
    const src = readFileSafe(p, 'utf8');

    // Chỉ chunk có code của bảng tin khách mới cần vá.
    if (!src.includes('GuestbookClient')) continue;

    let out = src;

    /** Áp dụng một cặp thay thế, kiểm tra số lần xuất hiện. */
    const apply = (from, to, label, expected = 1) => {
      const hits = countMatches(out, from);
      if (hits === 0) {
        problems.push(file + ': KHÔNG tìm thấy ' + label);
        return;
      }
      if (hits !== expected) {
        problems.push(
          file + ': ' + label + ' xuất hiện ' + hits + ' lần (mong đợi ' + expected + ')',
        );
        return;
      }
      out = out.split(from).join(to);
    };

    apply(OLD_FETCH_TPL, NEW_FETCH_TPL, 'fetch GET');
    apply(OLD_TURNSTILE, NEW_TURNSTILE, 'component Turnstile');
    apply(OLD_SUBMIT, NEW_SUBMIT, 'hàm gửi lời ghi');
    apply(OLD_API_FN, NEW_API_FN, 'hàm gọi API');
    apply(OLD_PROPS, NEW_PROPS, 'props + chế độ admin');
    apply(OLD_EFFECT, NEW_EFFECT, 'tải dữ liệu khi mở trang');
    apply(OLD_COPY, NEW_COPY, 'thông báo giới thiệu');

    if (out === src) continue;

    // Kiểm tra cú pháp TRƯỚC khi ghi.
    assertValidSyntax(out, file);

    writeFileSafe(p, out);
    console.log('  patched ' + file + ': ' + src.length + ' -> ' + out.length);
    patchedFiles++;
  }

  if (problems.length) {
    console.error('Có vấn đề khi vá client bundle:');
    for (const msg of problems) console.error('  ' + msg);
    console.error('Đừng deploy bản này — hãy sửa `tools/lib/guestbookPatch.mjs` cho khớp.');
  }

  if (!patchedFiles && !problems.length) {
    console.error('KHÔNG vá được chunk nào của bảng tin khách.');
    console.error('  Nếu bản build đã đổi cấu trúc, cần cập nhật chuỗi trong tools/lib/guestbookPatch.mjs.');
  }

  return { patchedFiles, problems };
}
