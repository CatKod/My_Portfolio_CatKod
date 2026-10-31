/**
 * Vá lỗi layout do trình duyệt mới gây ra + thêm thẻ ảnh chân dung.
 *
 * ============================================================================
 * VÍ DỤ 1 — mất tiêu đề chứng chỉ trên desktop (/credentials)
 * ============================================================================
 * Đo thật trên Chrome 154 (HeadlessChrome/154.0.0.0):
 *   CSS.supports('-webkit-line-clamp','2')  === true   (thuộc tính còn)
 *   CSS.supports('line-clamp','2')          === false  (chưa có bản chuẩn)
 *   CSS.supports('display','-webkit-box')   === true
 *
 * Đo hành vi thật: với `display:-webkit-box;-webkit-line-clamp:2`,
 * computed `display` ra `flow-root` => Chrome 154 KHÔNG còn thiết lập
 * box formatting context `-webkit-box`, nên cơ chế line-clamp legacy
 * không còn hoạt động. Text bị crop thô bởi `overflow:hidden`.
 *
 * Hậu quả nặng nhất: `.credential-preview-card strong` là grid item của
 * `.credential-card-copy` (display:grid; align-content:center). Vì có
 * `overflow:hidden`, automatic minimum size của grid item bằng 0 nên
 * track `auto` co về 0px => tiêu đề có height 0, biến mất hoàn toàn,
 * trong khi dòng issuer bên dưới vẫn hiện. Đây chính là lỗi user thấy:
 *
 *   strong.clientHeight = 0, strong.scrollHeight = 31
 *   copy.gridTemplateRows = "13.4219px 0px 15.6562px"   <- hàng 2 bằng 0
 *
 * Cách sửa (đã đo và kiểm chứng trên bản build thật):
 *
 *  1. `min-height:2lh` cho strong
 *     => track không thể co về 0, tiêu đề hiện đủ 2 dòng như thiết kế.
 *     `lh` tính theo line-height của chính nó (line-height:1, font-size
 *     ~14.7px => 2lh ≈ 29.4px).
 *
 *  2. `padding-bottom:2px; margin-bottom:-2px`
 *     => 2 dòng với line-height:1 bị thiếu ~1.3px chỗ hạ chữ (descender),
 *     nên scrollHeight > clientHeight (bị coi là "cắt chữ"). Padding 2px
 *     tạo chỗ cho descender, margin âm bù lại để khoảng cách hiển thị
 *     không đổi so với thiết kế gốc.
 *
 *  3. Trên desktop, panel chứng chỉ phải chiếm cả 2 hàng của board.
 *     Bản rebrand đã xoá panel "SK selesai kerja" nên ô (2/2) trống; nếu
 *     không trải panel chứng chỉ ra 2 hàng thì ô copy chỉ cao 46.8px và
 *     tiêu đề bị cắt cụt.
 *
 *   Lưu ý: dùng `grid-row:1/3` một mình SẼ phá auto-placement (panel
 *   chứng chỉ bị đẩy sang cột 1, đè lên panel tóm tắt). Vì vậy phải đặt
 *   `grid-area` tường minh cho cả 3 panel.
 *
 * ============================================================================
 * VÍ DỤ 2 — thẻ ảnh chân dung trên trang /about
 * ============================================================================
 * Đo thật trên bản build hiện tại (1440x900):
 *   .profile-brief   : x=245 y=289 w=397 h=286   (rows: 126px 148px)
 *   .history-panel   : x=656 y=289 w=723 h=438   (cột phải)
 *   => cột trái thấp hơn cột phải 152px: có khoảng trống dọc thật.
 *
 * `.profile-board` là grid `grid-template-rows:auto; align-items:start`, nên
 * cột trái được phép cao tới 438px mà không đẩy cột phải. Vì vậy thẻ ảnh
 * chân dung làm hàng thứ 3 của `.profile-brief`, nằm dưới GitHub heatmap:
 *
 *   126 + 12 + 148 + 12 + 132 = 430px  <= 438px  (khít, không tràn)
 *
 * Ở 1000px (721-1100px) slack là 127px nên hàng thứ 3 cao 112px:
 *   118 + 12 + 140 + 12 + 112 = 394px  <= 397px
 *
 * CSS do Gemini thiết kế theo brief (tools/brief-portrait.md).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'site/_next/static/chunks';
const files = readdirSync(dir).filter((f) => f.endsWith('.css'));

/**
 * Mỗi patch: [đoạn cũ, đoạn mới].
 * `null` cho đoạn cũ = chèn thêm (block @media mới, đặt trước lớp @property).
 */
const PATCHES = [
  // ---- 1. Tiêu đề chứng chỉ: grid track không được co về 0 -------------
  [
    '.credential-preview-card strong{color:var(--ink);-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:clamp(.78rem,1.02vw,1.05rem);line-height:1;display:-webkit-box;overflow:hidden}',
    '.credential-preview-card strong{color:var(--ink);-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:clamp(.78rem,1.02vw,1.05rem);line-height:1;display:-webkit-box;overflow:hidden;min-height:2lh;padding-bottom:2px;margin-bottom:-2px}',
  ],

  // ---- 2. Panel chứng chỉ chiếm cả 2 hàng (ô (2/2) trống) -------------
  // Phải đặt grid-area tường minh cho cả 3 panel, nếu không auto-placement
  // sẽ hoán đổi cột. Mobile giữ nguyên grid-area:auto.
  [
    null,
    '@media (min-width:721px){.credential-summary-panel{grid-area:1/1/2/2}.credential-certificate-panel{grid-area:1/2/3/3}.credential-role-panel{grid-area:2/1/3/2}}@media (max-width:720px){.credential-summary-panel,.credential-certificate-panel,.credential-role-panel{grid-area:auto}}',
  ],

  // ---- 3. Thẻ ảnh chân dung: hàng 3 của .profile-brief ------------------
  [
    '.profile-brief{grid-area:1/1;grid-template-rows:126px 148px;align-self:start;gap:12px;height:auto;min-height:0;max-height:286px;display:grid}',
    '.profile-brief{grid-area:1/1;grid-template-rows:126px 148px 132px;align-self:start;gap:12px;height:auto;min-height:0;max-height:430px;display:grid}',
  ],
  [
    '.profile-brief .github-activity{border-color:var(--line);min-height:148px;box-shadow:none;color:var(--ink);background:0 0}',
    '.profile-brief .github-activity{border-color:var(--line);min-height:148px;box-shadow:none;color:var(--ink);background:0 0}' +
      '.profile-portrait-card{width:100%;height:132px;max-height:132px;box-sizing:border-box;align-items:center;gap:16px;padding:12px 16px;border:1px solid var(--line);border-radius:0;background:linear-gradient(180deg, #fff3, transparent 72%), var(--panel);box-shadow:inset 0 1px #ffffff61;display:flex}' +
      '.profile-portrait-card *{min-width:0;box-sizing:border-box}' +
      '.profile-portrait-img{width:64px;height:80px;aspect-ratio:4/5;object-fit:cover;object-position:center 20%;flex-shrink:0;border:1px solid var(--line);border-radius:0;display:block}' +
      '.profile-portrait-info{flex:1;display:flex;flex-direction:column;justify-content:center}' +
      '.profile-portrait-label{font-family:var(--font-mono), ui-monospace, monospace;text-transform:uppercase;font-size:.56rem;font-weight:760;color:#11111180;letter-spacing:.06em;margin:0 0 4px;line-height:1.2}' +
      '.profile-portrait-name{font-weight:800;line-height:1;font-size:1.05rem;color:var(--ink);margin:0 0 5px}' +
      '.profile-portrait-role{color:#1111119e;font-size:.78rem;line-height:1.25;margin:0 0 4px}' +
      '.profile-portrait-meta{color:#1111119e;font-family:var(--font-mono), ui-monospace, monospace;font-size:.7rem;line-height:1.2;margin:0}',
  ],

  // ---- 4. Các biến thể responsive của .profile-brief: thêm hàng thứ 3 ---
  // 721-1100px: slack 127px -> hàng 3 cao 112px, tổng 394px <= 397px.
  [
    '.profile-brief{grid-template-rows:118px 140px;max-height:270px}',
    '.profile-brief{grid-template-rows:118px 140px 112px;max-height:394px}',
  ],
  // Màn hình thấp (max-height:760px): các hàng chuyển sang auto nên không thể
  // dùng max-height cứng (bản gốc vốn đã tràn 27px ở 1440x700). Thẻ ảnh phải
  // thu nhỏ lại để tổng chiều cao vẫn vừa cột phải:
  //   statement 125 + gap 12 + github 176 + gap 12 + card <= 414
  //   => card <= 89px  (dùng 86px)
  [
    '.profile-side-stack,.profile-brief{grid-template-rows:auto auto}',
    '.profile-side-stack,.profile-brief{grid-template-rows:auto auto auto}' +
      '.profile-brief{max-height:none}' +
      '.profile-portrait-card{height:86px;max-height:86px;padding:10px 14px;gap:12px}' +
      '.profile-portrait-img{width:48px;height:60px}',
  ],
  [
    '.profile-brief{order:1;grid-area:auto;max-height:none}',
    '.profile-brief{order:1;grid-area:auto;max-height:none}' +
      '.profile-portrait-card{height:auto;max-height:none;padding:12px 14px;gap:12px}' +
      '.profile-portrait-img{width:54px;height:68px}',
  ],
  [
    '.profile-brief{grid-template-rows:minmax(118px,auto) minmax(150px,auto)}',
    '.profile-brief{grid-template-rows:minmax(118px,auto) minmax(150px,auto) auto}',
  ],
];

let touched = 0;
let missed = 0;
for (const f of files) {
  const p = join(dir, f);
  const src = readFileSync(p, 'utf8');
  let out = src;
  for (const [from, to] of PATCHES) {
    if (from === null) {
      // Block @media mới chỉ chèn vào stylesheet chính (file chứa rule
      // .credentials-board). File CSS còn lại không có rule này nên chèn
      // vào sẽ thừa.
      if (!out.includes('.credentials-board{')) continue;
      // chèn trước lớp @property cuối cùng để không phá thứ tự layer
      const marker = '@property --tw-rotate-x';
      const idx = out.indexOf(marker);
      out = idx > 0 ? out.slice(0, idx) + to + out.slice(idx) : out + to;
      continue;
    }
    if (!out.includes(from)) {
      console.log('  KHONG tim thay trong ' + f + ': ' + from.slice(0, 70));
      missed++;
      continue;
    }
    out = out.split(from).join(to);
  }
  if (out !== src) {
    writeFileSync(p, out, 'utf8');
    console.log('patched ' + f + ': ' + src.length + ' -> ' + out.length);
    touched++;
  }
}
console.log('da patch ' + touched + ' file CSS, ' + missed + ' rule khong khop');
