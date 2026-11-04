/**
 * Vá lỗi chồng chữ giữa .home-intro và .home-system trên trang chủ (/).
 *
 * ============================================================================
 * PHÂN TÍCH NGUYÊN NHÂN GỐC
 * ============================================================================
 * 1. Cơ chế sập hàng Grid (Grid Row Collapse):
 *    - `.home-scene` có `grid-template-rows: min-content minmax(0,1fr) min-content`.
 *    - Row 1 (.home-title) và Row 3 (.home-system) dùng `min-content` nên chiếm
 *      toàn bộ chiều cao nội dung.
 *    - Row 2 (.home-intro) dùng `minmax(0, 1fr)`. Khi chiều cao viewport bị giới hạn
 *      (đặc biệt ở dải 800px-900px), CSS Grid ép Row 2 co về dưới chiều cao thực tế
 *      của `.home-intro` (chỉ còn ~140-180px, trong khi nội dung cần ~215-225px).
 *    - Vì `.home-intro` có `align-self: start` và `overflow: visible`, phần đáy của nó
 *      (khối nút bấm .home-actions và dòng text .home-intro-copy) tràn ra ngoài track
 *      Row 2, đè trực tiếp lên đỉnh của Row 3 (.home-system-head và thẻ card đầu tiên).
 *
 * 2. Điểm ngắt cứng @media (max-height: 760px) bỏ sót màn hình laptop 800px-900px:
 *    - Thiết kế gốc tạo bản compact ở `@media (max-height: 760px) and (min-width: 721px)`
 *      (giảm padding, giảm min-height thẻ card xuống 76px).
 *    - Các viewport 1200-1700 x 800 và 1100-1350 x 900 đều có chiều cao > 760px,
 *      do đó KHÔNG kích hoạt bản compact mà phải gánh toàn bộ padding/size desktop của màn 1080p+.
 *
 * 3. Khoảng đệm trống quá lớn từ các hàm clamp() và vh:
 *    - Ở `@media (min-width: 1180px)`, `.stage.stage--home .home-title` có:
 *      `padding-top: clamp(92px, 12vh, 132px)`. Tại 800px-900px, padding-top chiếm tới
 *      96px-108px khoảng trống chết ở đỉnh.
 *    - `.home-intro` có `padding-top: clamp(24px, 4vh, 48px)` (32px-36px).
 *    - `gap: clamp(14px, 2.2vw, 28px)` tính theo vw nên ở màn rộng nhưng lùn (1600x800),
 *      gap đạt tối đa 28px (tổng 2 gap = 56px).
 *    => Tổng khoảng trống chết dọc > 185px, bóp nghẹt không gian của Row 2.
 *
 * 4. Khe hở breakpoint giữa 1100px và 1180px:
 *    - `@media (max-width: 1100px)` kết thúc ở 1100px.
 *    - `@media (min-width: 1180px)` bắt đầu ở 1180px.
 *    - Dải 1101px - 1179px rơi vào CSS Base với 4 thẻ capability nằm trên 1 hàng hẹp,
 *      khiến text mô tả bị bẻ 5-6 dòng, chiều cao .home-system tăng vọt > 200px.
 *
 * ============================================================================
 * GIẢI PHÁP KHẮC PHỤC (GIỮ NGUYÊN 100% DIỆN MẠO HIỆN TẠI)
 * ============================================================================
 * 1. Chuyển track Row 2 sang `minmax(min-content, 1fr)`:
 *    - Đảm bảo Row 2 không bao giờ co nhỏ hơn nội dung thực tế của `.home-intro`.
 *    - Row 3 (.home-system) luôn bắt đầu sau Row 2 + gap => triệt tiêu hoàn toàn khả năng chồng text.
 * 2. Tinh chỉnh `clamp()` theo vh hợp lý:
 *    - `.stage.stage--home .home-title`: `clamp(24px, 4.5vh, 68px)` thay vì `clamp(92px, 12vh, 132px)`.
 *      Tiết kiệm 50px-68px chiều cao trống trên màn hình lùn, trong khi màn 1080p vẫn thoáng đẹp.
 *    - `.home-intro`: `clamp(10px, 2vh, 28px)` thay vì `clamp(24px, 4vh, 48px)`. Tiết kiệm 16px-20px.
 *    - `gap`: `clamp(12px, 1.6vh, 22px)` để co giãn theo chiều dọc hợp lý.
 * 3. Đóng khe hở breakpoint:
 *    - Mở rộng `@media (min-width: 1180px)` thành `@media (min-width: 1101px)` để giữ bố cục desktop 2 cột
 *      liên tục và ổn định từ 1101px trở lên.
 * 4. Fallback chống tràn cho .stage.stage--home:
 *    - Bật `overflow-y: auto` (đã có scrollbar ẩn) để trong trường hợp cực đoan (cửa sổ siêu nhỏ < 600px),
 *      nội dung vẫn có thể cuộn được mà không bị cắt cụt hay đè chữ.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = existsSync('site/_next/static/chunks')
  ? 'site/_next/static/chunks'
  : join(__dirname, '..', 'site', '_next', 'static', 'chunks');

const files = readdirSync(dir).filter((f) => f.endsWith('.css'));

/**
 * Mỗi patch: [đoạn cũ, đoạn mới].
 * `null` cho đoạn cũ = chèn thêm vào stylesheet chính chứa .credentials-board{.
 */
const PATCHES = [
  // ---- 1. Base .home-scene: Row 2 không được co về 0, gap theo vh --------
  [
    '.home-scene{grid-template-rows:min-content minmax(0,1fr) min-content;grid-template-columns:minmax(0,1fr);gap:clamp(14px,2.2vw,28px);display:grid;position:relative;overflow:hidden}',
    '.home-scene{grid-template-rows:min-content minmax(min-content,1fr) min-content;grid-template-columns:minmax(0,1fr);gap:clamp(12px,1.6vh,22px);display:grid;position:relative;overflow:hidden;min-height:100%;height:auto}',
  ],

  // ---- 2. Base .home-intro: giảm padding-top trống -----------------------
  [
    '.home-intro{z-index:2;grid-area:2/1;align-self:start;width:100%;max-width:none;margin-inline:0;padding-top:clamp(24px,4vh,48px);padding-bottom:2px;position:relative}',
    '.home-intro{z-index:2;grid-area:2/1;align-self:start;width:100%;max-width:none;margin-inline:0;padding-top:clamp(10px,2vh,28px);padding-bottom:2px;position:relative}',
  ],

  // ---- 3. Base .home-title: giảm khoảng đệm đỉnh quá cỡ -----------------
  [
    '.home-title{z-index:2;grid-area:1/1;width:100%;max-width:none;margin-inline:0;padding-top:clamp(56px,8.5vh,88px);position:relative}',
    '.home-title{z-index:2;grid-area:1/1;width:100%;max-width:none;margin-inline:0;padding-top:clamp(24px,4.5vh,64px);position:relative}',
  ],

  // ---- 4. Desktop media query: đóng khe hở 1101-1179px & hạ padding-top 92px
  [
    '@media (min-width:1180px){.home-scene{z-index:2;grid-template-columns:minmax(0,.72fr) minmax(350px,.48fr);position:relative}.stage.stage--home .home-title{padding-top:clamp(92px,12vh,132px)}.stage.stage--home .home-line-art{width:min(88vw,1040px);height:min(132vh,1080px);display:block;inset:clamp(-270px,-22vh,-132px) clamp(-210px,-12vw,-84px) auto auto}.home-signal{justify-self:end;width:min(100%,520px);display:grid}}',
    '@media (min-width:1101px){.home-scene{z-index:2;grid-template-columns:minmax(0,.72fr) minmax(350px,.48fr);position:relative}.stage.stage--home .home-title{padding-top:clamp(24px,4.5vh,68px)}.stage.stage--home .home-line-art{width:min(88vw,1040px);height:min(132vh,1080px);display:block;inset:clamp(-270px,-22vh,-132px) clamp(-210px,-12vw,-84px) auto auto}.home-signal{justify-self:end;width:min(100%,520px);display:grid}}',
  ],

  // ---- 5. Tablet & compact rules: ngăn sập hàng Row 2 --------------------
  [
    'grid-template-rows:auto minmax(0,1fr) min-content;',
    'grid-template-rows:auto minmax(min-content,1fr) min-content;',
  ],

  // ---- 6. Cho phép scroll nhẹ khi viewport bị ép cực nhỏ ----------------
  [
    '.stage{padding:22px 28px;overflow-y:auto}.stage.stage--home{overflow:hidden}',
    '.stage{padding:22px 28px;overflow-y:auto}.stage.stage--home{overflow-y:auto}',
  ],

  // ---- 7. Đảm bảo stage--home có overflow-y: auto ở CSS chính ------------
  [
    null,
    '.stage.stage--home{overflow-y:auto}',
  ],
];

let touched = 0;
let missed = 0;
for (const f of files) {
  const p = join(dir, f);
  const src = readFileSync(p, 'utf8');

  // Chỉ patch vào stylesheet chứa .credentials-board{ theo yêu cầu
  if (!src.includes('.credentials-board{')) {
    continue;
  }

  let out = src;
  for (const [from, to] of PATCHES) {
    if (from === null) {
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
