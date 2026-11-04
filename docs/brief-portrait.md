# BRIEF — Thẻ ảnh chân dung trên trang /about

## 1. Deliverable

Viết ra **một khối CSS** và **một khối HTML** để tôi đưa vào site tĩnh.

- CSS: một khối rule duy nhất, dán vào cuối stylesheet.
- HTML: một khối markup duy nhất, dán vào trong `.profile-brief`.

Cả hai phải dùng **đúng** các class/ID tôi nêu dưới đây. Không thêm file, không thêm script.

## 2. Vị trí chính xác (đo thật trên Chrome 154, viewport 1440x900)

Trang `/about` có `.profile-board` (grid 2 cột: cột trái `.profile-brief`, cột phải `.history-panel`).

Cột trái `.profile-brief` hiện tại:

```
.profile-brief {
  grid-area: 1/1;
  grid-template-rows: 126px 148px;   /* hàng 1: statement-panel, hàng 2: github-activity */
  align-self: start;
  gap: 12px;
  height: auto;
  min-height: 0;
  max-height: 286px;
  display: grid;
}
```

Đo thật:
- `.profile-brief`      : x=245 y=289 w=397 h=286
- `.statement-panel`   : x=245 y=289 w=397 h=126
- `.github-activity`   : x=245 y=427 w=397 h=148
- `.history-panel` (cột phải): x=656 y=289 w=723 h=438  → cột phải cao hơn cột trái **152px**

`.profile-board` là `grid-template-rows: auto; align-items: start`, nên cột trái được phép cao tới 438px mà không đẩy cột phải.

**Khoảng trống thật sự: 152px dọc dưới `.github-activity`, ngay trong cột trái.**

Vì vậy thẻ ảnh chân dung sẽ là **hàng thứ 3 của `.profile-brief`**, nằm dưới GitHub heatmap.

## 3. Ảnh

- File: `/images/profile/portrait.webp` (đã có sẵn trong site, 33 KB, webp).
- Tỉ lệ ảnh: 4:5 (chiều rộng × 1.25 = chiều cao).
- Nội dung: chân dung chính diện, người mặc vest đen, **khuôn mặt nằm ở 1/3 trên** của khung ảnh (không phải chính giữa).
- Khi dùng `object-fit: cover`, phải dùng `object-position` để giữ mặt ở phần trên, KHÔNG để mặt bị cắt.

## 4. Design token của site (dùng đúng, không tự đặt màu mới)

```
--ink:      #111
--paper:    #e8e8e5
--paper-soft: #f1f1ee
--accent:   #111
--line:     #1111113d      (đường viền 1px)
--panel:    #f1f1ee9e
--panel-soft: #f7f7f457
--surface-texture: radial-gradient(circle at 1px 1px, #1111111f 1px, transparent 1.7px), ... (dùng var(--surface-texture))
```

Quy tắc style hiện có của site (copy nguyên văn, đừng phát minh):

```css
.statement-panel,.history-column,.history-list article,.focus-map article,.stack-board article,.timeline-strip article {
  border:1px solid var(--line);
  background:linear-gradient(180deg, #fff3, transparent 72%), var(--panel);
  box-shadow:inset 0 1px #ffffff61;
}
```

Font chữ:
- Nhãn micro (kiểu "CURRENT DIRECTION"): `font-family: var(--font-mono), ui-monospace, monospace; text-transform: uppercase; font-size: .56rem; font-weight: 760; color: #11111180;`
- Tiêu đề: `font-weight: 800; line-height: 1;`
- Chữ thường: `color: #1111119e;`

Bán kính bo góc: site dùng `border-radius: 0` cho panel, `2px` cho các phần nhỏ, `16px` cho khung ngoài. **Dùng `0` cho thẻ ảnh chân dung** để khớp panel.

## 5. Nội dung thẻ

Ảnh chân dung + vài dòng chữ nhận dạng. Nội dung đúng nguyên văn:

- Nhãn: `Profile photo`
- Tên: `Hoàng Kim Vĩnh`
- Dòng phụ: `Embedded firmware engineer`
- Dòng meta: `HUST 20235876 · Hanoi, Vietnam`

Đừng thêm icon, đừng thêm link, đừng thêm mô tả dài.

## 6. Ràng buộc cứng

1. **Thẻ phải cao tối đa 132px** (để tổng cột trái = 126 + 12 + 148 + 12 + 132 = 430px, vừa khít 438px của cột phải, không tràn).
2. Thẻ phải **co giãn theo chiều ngang** (`width: 100%`), chiều cao cố định bằng `grid-template-rows` hoặc `height`.
3. **Layout ngang**: ảnh bên trái, chữ bên phải (ảnh ~64px rộng × 80px cao, tỉ lệ 4:5).
4. `min-width: 0` trên mọi phần tử con (để text không phá grid).
5. **Mobile (≤720px)**: `.profile-brief` chuyển sang 1 cột, các hàng `auto`. Thẻ ảnh phải vẫn hiển thị đẹp, không tràn ngang, ảnh và chữ vẫn nằm ngang (ảnh nhỏ hơn ~54×68px là được).
6. Không dùng `position:absolute` để đặt ảnh (dễ vỡ khi đổi kích thước).
7. Không thêm `box-shadow` đậm, không thêm màu nền mới, không thêm gradient mới ngoài gradient pattern có sẵn.
8. Không được làm thẻ cao hơn 132px ở desktop, không được làm cột trái vượt quá 438px.

## 7. Tiêu chí nghiệm thu

Tôi sẽ chạy Playwright và kiểm:
- `.profile-brief` cao ≤ 438px, `.profile-portrait-card` cao ≤ 132px ở 1440x900.
- Không phần tử nào có `scrollHeight > clientHeight + 1` (chữ bị cắt).
- Ảnh hiển thị đúng, không 404.
- Ở 390x844: không có tràn ngang (`document.documentElement.scrollWidth <= 390`).

## 8. Biên

Chỉ đọc brief này. KHÔNG đọc source code. Trả lời đúng 2 khối code:

```
<!-- HTML -->
```html
...```   (đặt trong .profile-brief, sau .github-activity)

/* CSS */
```css
...```
```

Bắt đầu bằng CSS hay HTML đều được, nhưng phải rõ ràng.
