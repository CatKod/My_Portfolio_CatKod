# Kiến trúc dự án — My_Portfolio_CatKod

Repo này **không phải** source website. Đây là **pipeline dựng lại** một website
tĩnh Next.js (export tĩnh) đã đổi thương hiệu từ bản gốc sang profile của
Hoàng Kim Vĩnh (CatKod), rồi publish lên GitHub Pages.

Toàn bộ code nguồn của website đã publish **không nằm trong repo này** — nó
được sinh ra bởi pipeline từ `site.orig.bak/` + các script vá.

## 1. Bức tranh tổng thể

```
site.orig.bak/          bản site gốc (upstream, gitignored — tải bằng bootstrap.mjs)
        │
        ▼
tools/build/buildSite.mjs ──► site/           site tĩnh đã đổi thương hiệu
        │                         │
        │                         ▼
        │                   tools/deploy/deployPages.mjs ──► deploy/ ──► repo Pages
        │
        ▼
site/pdf/CV_*.pdf       CV sinh từ tools/data/profile.mjs
```

Nguồn nội dung duy nhất: **`tools/data/profile.mjs`**. Mọi thứ (DOM SSR, RSC
flight payload, CV PDF) đều lấy từ đó — sửa file này là site đổi.

## 2. Cấu trúc `tools/`

| Thư mục       | Vai trò                                                      | Chạy bằng                       |
|---------------|--------------------------------------------------------------|---------------------------------|
| `build/`      | Các bước biến đổi site: rebrand, vá CSS, đổi tên chunk      | `node tools/build/buildSite.mjs`|
| `lib/`        | Module dùng chung: DOM, flight payload, render, ghi file an toàn | import          |
| `data/`       | Nguồn nội dung duy nhất: `profile.mjs`, `icons.mjs`           | import          |
| `cv/`         | Sinh CV PDF từ `profile.mjs`                                 | `node tools/cv/buildCv.mjs`     |
| `deploy/`     | Chuẩn bị bản deploy + đồng bộ sang repo GitHub Pages         | `node tools/deploy/deployPages.mjs` |
| `verify/`     | Kiểm tra sau khi build: route, icon map, tham chiếu, parity   | xem `package.json`              |
| `config/`     | Đường dẫn gốc của repo + manifest bản gốc                   | import          |
| `scratch/`    | Script điều tra 1-lần từ quá trình rebrand (**gitignored**)  | tự chạy        |

### 2.1 `tools/config/paths.mjs`

Nguồn duy nhất cho mọi đường dẫn. Mọi script dùng `rel()` / `SITE_DIR` /
`CHUNKS_DIR`... thay vì hardcode `'site/_next/static/chunks'`. Nhờ vậy script
chạy được từ bất kỳ thư mục làm việc nào.

Các hằng số có sẵn:

| Hằng số       | Trỏ tới                          |
|---------------|----------------------------------|
| `ROOT`        | thư mục gốc repo                 |
| `TOOLS_DIR`   | thư mục `tools/`                 |
| `ORIG_DIR`    | `site.orig.bak/` (bản gốc)       |
| `SITE_DIR`    | `site/` (bản build)              |
| `CHUNKS_DIR`  | `site/_next/static/chunks`       |
| `MEDIA_DIR`   | `site/_next/static/media`        |
| `PDF_DIR`     | `site/pdf`                       |
| `CV_PDF`      | đường dẫn file CV                |
| `IMAGES_DIR`  | `site/images`                    |
| `DEPLOY_DIR`  | `deploy/` (bản chuẩn bị publish) |
| `PAGES_REPO`  | repo GitHub Pages đích           |
| `rel(...)`    | nối đường dẫn tương đối → tuyệt đối |

### 2.2 `tools/lib/writeSafe.mjs`

Bọc `readFileSync`/`writeFileSync` với cơ chế retry. Cần thiết vì Windows
đôi khi báo `UNKNOWN: unknown error` khi handle của file vừa copy chưa giải
phóng xong — đây chính là lỗi làm build fail ngẫu nhiên trước khi refactor.

- `writeFileSafe`: ghi ra file tạm rồi `rename` đè (atomic, không cần mở file đích).
- `readFileSafe`: thử lại 8 lần, mỗi lần chờ 150ms khi gặp lỗi tạm thời.

### 2.3 `tools/lib/` — module dùng chung

| Module          | Trách nhiệm                                                  |
|-----------------|--------------------------------------------------------------|
| `dom.mjs`       | Tìm phần tử theo class, cân bằng thẻ, escape                 |
| `flight.mjs`    | Tách/ghép RSC flight payload của Next.js                     |
| `flightNode.mjs`| Tìm & thay node con trong AST của flight payload             |
| `build.mjs`     | Render markup SSR cho component động (logo loop, skill card…) |
| `skillsFlight.mjs` | Render flight payload cho trang `/skills`                  |
| `calendarDom.mjs`  | Render lịch đóng góp GitHub                                |
| `logo.mjs`      | SVG + flight + JSX của monogram CK                           |
| `socials.mjs`   | Ánh xạ icon/label mạng xã hội                                |
| `common.mjs`    | Bảng thay thế chung (dùng `profile.mjs`)                     |
| `cv.mjs`        | Sinh HTML cho CV                                             |
| `transform.mjs` | Biến đổi cây DOM dùng chung                                 |
| `replacements.mjs` | Bảng thay thế nội dung bản gốc                            |
| `exec.mjs`      | `runTool(script, ...args)` — chạy script con trong `tools/`   |
| `writeSafe.mjs` | Ghi/đọc file an toàn trên Windows                            |

## 3. Pipeline build

`node tools/build/buildSite.mjs` chạy 9 bước, **đúng thứ tự**:

| # | Bước                                        | Script                        |
|---|---------------------------------------------|-------------------------------|
| 0 | Dừng server Kotlin đang giữ file            | (powershell, inline)          |
| 1 | Reset chunk về bản gốc                      | (inline `cpSync`)             |
| 2 | Rebrand: HTML + DOM + flight + chunk         | `build/rebrand.mjs`           |
| 3 | Đổi thẻ chứng chỉ sang link verify          | `build/patchCredLink.mjs`     |
| 4 | Đồng bộ icon map client với `data/icons.mjs`| `build/synciconmap.mjs`       |
| 5 | Vá CSS (mất chữ desktop, thẻ ảnh chân dung) | `build/patchCss.mjs`          |
| 6 | Đổi tên chunk theo hash nội dung            | `build/renameChunks.mjs`      |
| 7 | Dọn thế hệ chunk cũ                          | `build/pruneChunks.mjs`       |
| 8 | Kiểm tra mọi tham chiếu còn hợp lệ         | `verify/refcheck.mjs`         |
| 9 | Sinh CV PDF                                  | `cv/buildCv.mjs`              |

### 3.1 Vì sao bước 6-8 là bắt buộc

Tên chunk của Next.js là **hash nội dung**. Sau khi vá nội dung (bước 2-5), tên
cũ không còn đúng. GitHub Pages cache HTML `max-age=600` và **không cho
override `Cache-Control`**, nên nếu giữ tên cũ, người dùng nhận JS/CSS cũ →
hydration mismatch (React error #418) hoặc thấy layout cũ.

Cách bust cache khả dụng duy nhất trên GitHub Pages: **đặt lại tên file theo
hash nội dung** (`renameChunks.mjs`), để mỗi lần deploy sinh URL mới.

`pruneChunks.mjs` giữ lại 2 thế hệ gần nhất — vì HTML đã cache trong trình
duyệt vẫn trỏ tới tên file cũ. Xoá hẳn sẽ khiến asset 404.

### 3.2 Vì sao phải giữ alias thế hệ cũ

`deploy/syncLegacyChunks.mjs` ghi đè các file chunk tên cũ (`.catkod.<hash>`) bằng
nội dung **đã vá**. Nếu không: HTML cache tham chiếu tên cũ → 404 hoặc CSS cũ.

## 4. Deploy

```bash
node tools/deploy/deployPages.mjs
```

1. `prepareDeploy.mjs` — `site/` → `deploy/`: route không đuôi → thư mục kèm
   `index.html`, thêm `.nojekyll`.
   *Bắt buộc*: GitHub Pages phục vụ file không đuôi với
   `Content-Type: application/octet-stream` → trình duyệt tải file thay vì render.
2. `syncPages.mjs` — `deploy/` → repo Pages (giữ `README.md`).
3. `syncLegacyChunks.mjs` — ghi đè alias chunk thế hệ cũ.

Repo đích: biến môi trường `CATKOD_PAGES_REPO`, mặc định
`D:/GitHub/CatKod.github.io.pages`.

## 5. Bootstrap

`site.orig.bak/` bị gitignore (4.4 MB) nên **clone repo mới không build được**.
Chạy `node tools/bootstrap.mjs` để tải lại 52 file gốc từ upstream theo
`tools/config/origin-manifest.json`.

## 6. Quy ước

- Mọi đường dẫn lấy từ `tools/config/paths.mjs`, không hardcode.
- Mọi ghi/đọc file dùng `writeFileSafe`/`readFileSafe` từ `tools/lib/writeSafe.mjs`.
- Mọi script con được gọi qua `runTool()` từ `tools/lib/exec.mjs` (tuyệt đối, cwd = repo root).
- Nội dung site chỉ sửa trong `tools/data/profile.mjs` và `tools/data/icons.mjs`.
- Script điều tra 1-lần để vào `tools/scratch/` (gitignored), không commit.
- `tools/verify/` là nơi duy nhất cho script kiểm tra — dùng lại được nhiều lần.
- `docs/templates/` giữ markup gốc của từng component, dùng làm tham khảo khi vá.

## 7. Kiểm tra

```bash
npm run build          # build + kiểm tra tham chiếu + sinh CV
npm run check          # parity SSR DOM vs DOM sau hydration (cần Playwright + server)
npm run check:icons    # icon map client khớp data/icons.mjs
node tools/verify/checkroutes.mjs      # HTTP status các route trên live
node tools/verify/liveverify.mjs       # asset trên live còn tồn tại
node tools/verify/checkicons.mjs       # icon CDN còn tồn tại
```
