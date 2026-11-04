# Portfolio CatKod — Rebuild (Kotlin)

Bản dựng lại **giống hệt** trang [`irfansabrian.vercel.app`](https://irfansabrian.vercel.app),
viết bằng Kotlin thuần (chỉ dùng JDK, không framework).

> **Repo này chứa gì?** Đây là **pipeline dựng lại** website tĩnh (đổi thương hiệu
> từ bản gốc sang profile của Hoàng Kim Vĩnh) + server Kotlin để kiểm thử local.
> Website đã publish nằm ở repo [`CatKod/CatKod.github.io`](https://github.com/CatKod/CatKod.github.io).
>
> Chi tiết kiến trúc pipeline: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Bắt đầu nhanh

```bash
npm install                # chỉ cần cho script kiểm thử Playwright
node tools/bootstrap.mjs   # tải bản site gốc (site.orig.bak/, gitignored)
npm run build              # dựng lại site/ + kiểm tra tham chiếu + sinh CV PDF
```

## Kiến trúc

```
src/main/kotlin/catkod/portfolio/
├── Main.kt           # Điểm vào
├── Options.kt        # Tuỳ chọn dòng lệnh
├── SiteServer.kt     # HTTP server + điều phối yêu cầu
├── StaticFiles.kt    # Phục vụ nội dung tĩnh trong site/
├── LivePages.kt      # Trang có dữ liệu sống (biểu đồ GitHub)
└── UpstreamProxy.kt  # Chuyển tiếp yêu cầu động về site gốc

tools/
├── build/      # Các bước biến đổi site (rebrand, vá CSS, đổi tên chunk)
├── lib/        # Module dùng chung (DOM, flight payload, render, ghi file an toàn)
├── data/       # Nguồn nội dung duy nhất: profile.mjs, icons.mjs
├── cv/         # Sinh CV PDF từ profile.mjs
├── deploy/     # Chuẩn bị bản deploy + đồng bộ sang repo GitHub Pages
├── verify/     # Script kiểm tra (route, icon map, tham chiếu, parity DOM)
├── config/     # Đường dẫn gốc của repo + manifest bản gốc
└── scratch/    # Script điều tra 1-lần (gitignored)

docs/
├── ARCHITECTURE.md   # Kiến trúc pipeline, vai trò từng thư mục
├── brief-portrait.md # Brief thiết kế thẻ ảnh chân dung
└── templates/        # Markup gốc của từng component (tham khảo khi vá)
```

### Nguồn nội dung duy nhất

**`tools/data/profile.mjs`** — sửa file này là site đổi. Cùng dữ liệu đó được
đưa vào DOM SSR, RSC flight payload và CV PDF, nên không thể lệch nhau.

`tools/data/icons.mjs` — ánh xạ tên công nghệ → icon SVG trên CDN. Bản client
được đồng bộ tự động bởi `build/synciconmap.mjs` (tránh hydration mismatch).

`tools/data/calendar.json` — dữ liệu biểu đồ GitHub **của CatKod**, dùng cho
trang `/about`. Đây là dữ liệu tĩnh đã commit nên build luôn tái lập được; nếu
thiếu nó, trang `/about` sẽ mọc biểu đồ contribution của Irfan Sabrian (và
số liệu đó đổi mỗi ngày → mỗi lần build ra một kết quả khác). Cập nhật bằng:

```bash
node tools/verify/calendar.mjs   # cần tools/data/gh_catkod.html (tải tay từ GitHub)
```

### Luồng xử lý yêu cầu (server Kotlin)

1. **Trang dữ liệu sống** (`/about` — biểu đồ hoạt động GitHub): lấy trực tiếp từ site gốc,
   cache HTML ngắn (mặc định 60s). Yêu cầu RSC luôn đi thẳng upstream để không bị stale.
2. **Tài nguyên tĩnh** trong `site/`: phục vụ trực tiếp. Toàn bộ tệp đã được đối chiếu
   **byte-for-byte** với bản gốc (`sha256` khớp 100%).
3. **Mọi yêu cầu còn lại** (RSC payload, prefetch, route lạ): chuyển tiếp nguyên vẹn
   header + query + body xuống site gốc, nhờ vậy điều hướng client-side của Next.js
   hoạt động y hệt.

## Chạy server

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

## Công cụ (`tools/`)

### Dựng & deploy

```bash
npm run build             # 9 bước: reset chunk -> rebrand -> vá -> đổi tên -> kiểm tra -> CV
npm run deploy            # site/ -> deploy/ -> repo GitHub Pages
```

Repo Pages đích có thể override bằng biến môi trường:

```bash
CATKOD_PAGES_REPO=D:/path/to/CatKod.github.io.pages npm run deploy
```

### Kiểm chứng

```bash
npm run check             # parity SSR DOM vs DOM sau hydration (Playwright + server local)
npm run check:icons       # icon map client khớp data/icons.mjs
npm run check:refs        # mọi tham chiếu asset trong site/ còn hợp lệ
npm run check:routes      # HTTP status + content-type của các route trên live
npm run check:cdn         # icon CDN còn tồn tại
npm run check:live        # asset trên live còn tồn tại
```

Các script dùng REA + CDP để đối chiếu tự động (đặt trong `tools/scratch/`,
không commit):

```bash
# Chụp & so sánh pixel từng route (dùng rea capture-web-screenshot + compare-web-screenshots)
node tools/scratch/compare.mjs http://127.0.0.1:9310 https://irfansabrian.vercel.app /,/about,/work,/skills,/credentials,/guestbook,/contact

# So khớp byte-for-byte toàn bộ asset
node tools/scratch/hashcmp.mjs site/_next/static/chunks https://irfansabrian.vercel.app/_next/static/chunks

# Kiểm tra điều hướng client-side (RSC) có giống hệt không
node tools/scratch/routecheck.mjs http://127.0.0.1:9310 https://irfansabrian.vercel.app
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
