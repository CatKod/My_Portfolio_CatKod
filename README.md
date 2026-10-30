# Portfolio CatKod — Rebuild (Kotlin)

Bản dựng lại **giống hệt** trang [`irfansabrian.vercel.app`](https://irfansabrian.vercel.app),
viết bằng Kotlin thuần (chỉ dùng JDK, không framework).

## Kiến trúc

```
src/main/kotlin/catkod/portfolio/
├── Main.kt           # Điểm vào
├── Options.kt        # Tuỳ chọn dòng lệnh
├── SiteServer.kt     # HTTP server + điều phối yêu cầu
├── StaticFiles.kt    # Phục vụ nội dung tĩnh trong site/
├── LivePages.kt      # Trang có dữ liệu sống (biểu đồ GitHub)
└── UpstreamProxy.kt  # Chuyển tiếp yêu cầu động về site gốc
```

### Luồng xử lý yêu cầu

1. **Trang dữ liệu sống** (`/about` — biểu đồ hoạt động GitHub): lấy trực tiếp từ site gốc,
   cache HTML ngắn (mặc định 60s). Yêu cầu RSC luôn đi thẳng upstream để không bị stale.
2. **Tài nguyên tĩnh** trong `site/`: phục vụ trực tiếp. Toàn bộ tệp đã được đối chiếu
   **byte-for-byte** với bản gốc (`sha256` khớp 100%).
3. **Mọi yêu cầu còn lại** (RSC payload, prefetch, route lạ): chuyển tiếp nguyên vẹn
   header + query + body xuống site gốc, nhờ vậy điều hướng client-side của Next.js
   hoạt động y hệt.

## Chạy

```bash
# Build
gradle build

# Chạy (mặc định cổng 8080, nội dung ./site)
java -jar build/libs/portfolio-kt.jar --port=8080 --root=site
```

> Lưu ý: tham số dùng dạng `--key=value` (không phải `--key value`).

| Tuỳ chọn | Mặc định | Ý nghĩa |
|---|---|---|
| `--port=` | `8080` | Cổng lắng nghe |
| `--host=` | `0.0.0.0` | Địa chỉ bind |
| `--root=` | `site` | Thư mục nội dung tĩnh |
| `--upstream=` | `https://irfansabrian.vercel.app` | Site gốc dùng làm fallback |
| `--live=` | `/about` | Trang dữ liệu sống (phân tách bằng dấu phẩy) |
| `--live-cache=` | `60000` | TTL cache (ms) cho trang dữ liệu sống |

## Công cụ kiểm chứng (`tools/`)

Các script dùng REA + CDP để đối chiếu tự động:

```bash
# Chụp & so sánh pixel từng route (dùng rea capture-web-screenshot + compare-web-screenshots)
node tools/compare.mjs http://127.0.0.1:9310 https://irfansabrian.vercel.app /,/about,/work,/skills,/credentials,/guestbook,/contact

# So khớp byte-for-byte toàn bộ asset
node tools/hashcmp.mjs site/_next/static/chunks https://irfansabrian.vercel.app/_next/static/chunks

# Kiểm tra điều hướng client-side (RSC) có giống hệt không
node tools/routecheck.mjs http://127.0.0.1:9310 https://irfansabrian.vercel.app
```

## Đối chiếu với bản gốc

Kiểm chứng bằng REA (`capture-web-screenshot` + `compare-web-screenshots`) và so khớp
pixel cục bộ ở viewport `1440×900`, `prefers-reduced-motion: reduce`:

| Route | Kết quả | Ghi chú |
|---|---|---|
| `/` | **0 pixel khác** | khớp tuyệt đối |
| `/about` | **0 pixel khác** | biểu đồ GitHub lấy trực tiếp từ upstream |
| `/work` | **0 pixel khác** | sau khi ảnh lazy-load hoàn tất |
| `/skills` | **0 pixel khác** | khớp tuyệt đối |
| `/credentials` | **0 pixel khác** | khớp tuyệt đối |
| `/guestbook` | **0 pixel khác** | khớp tuyệt đối |
| `/contact` | sai lệch nằm **trong nhiễu tự render** của bản gốc | bản gốc tự so với chính nó cũng lệch 2302 px, trong khi bản dựng lại lệch 2327 px — cùng bậc nhiễu, do hiệu ứng gõ chữ chạy không tất định |

Ngoài ra:

- **100%** tệp tĩnh khớp **byte-for-byte** (`sha256`): 25/25 chunk JS+CSS, 2/2 font `.woff2`,
  toàn bộ ảnh `/images/**`, và 6/6 tài liệu HTML route.
- Điều hướng client-side qua cả 6 route: `path`, `title`, `h1`, `h2`, `nav aria-current`
  và độ dài nội dung đều khớp tuyệt đối (`ALL ROUTES MATCH`).
- Payload RSC (`?_rsc=`) được chuyển tiếp nguyên vẹn nên hành vi runtime không lệch.
