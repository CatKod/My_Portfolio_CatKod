# My Portfolio CatKod

Portfolio Next.js 15 cho **Hoàng Kim Vĩnh (CatKod)** — full-stack web developer với AI workflows, automation pipelines, và GIS tools.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** + **TailwindCSS**
- Fonts: **Bricolage Grotesque** (display) + **JetBrains Mono** (labels)
- Đa ngôn ngữ: **Tiếng Việt / English / 日本語**

## Trang

- `/` — Hero với rotating role text + capability map
- `/about` — Câu chuyện cá nhân
- `/projects` — 6 dự án showcase
- `/skills` — Tech stack với 6 nhóm
- `/credentials` — Chứng chỉ + giáo dục
- `/guestbook` — Form lưu bút (localStorage)
- `/contact` — Form liên hệ

## Phát triển

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Cấu trúc

```
src/
  app/
    page.tsx              # Home
    layout.tsx            # root layout + portfolio shell
    globals.css           # paper/ink theme + components
    about/                # About page
    projects/             # Projects page
    skills/               # Skills page
    credentials/          # Credentials page
    guestbook/            # Guestbook page
    contact/              # Contact page
  components/
    PortfolioShell.tsx    # Header + footer + side nav
    InitialLoader.tsx     # "Hello" loader với scanline
    DotField.tsx          # Mouse-reactive dot canvas
    TargetCursor.tsx      # Custom cursor với corners
    MobileMenu.tsx        # Mobile staggered menu
    LanguageSwitch.tsx    # VI / EN / JA switcher
    LanguageProvider.tsx  # i18n context + dictionaries
```

## Tuỳ chỉnh

1. Thay thông tin cá nhân trong `LanguageProvider.tsx` (translations) và `PortfolioShell.tsx` (brand + social links).
2. Sửa 6 projects trong `src/app/projects/ProjectsClient.tsx`.
3. Sửa credentials trong `src/app/credentials/CredentialsClient.tsx`.
4. Thay SVG brand mark tại `PortfolioShell.tsx` nếu muốn logo riêng.

## License

MIT — Copyright (c) 2026 Hoàng Kim Vĩnh