# Portfolio CatKod — Hoàng Kim Vĩnh

## Brief thiết kế

**Field:** Full-stack web developer + AI + Automation cho Hoàng Kim Vĩnh (CatKod).
**Audience:** Nhà tuyển dụng, khách hàng freelance, cộng đồng dev.
**Mục tiêu:** Tạo portfolio Next.js App Router cao cấp, lấy cảm hứng từ irfansabrian.vercel.app nhưng được Việt hoá và cá nhân hoá.

## Cấu trúc trang (7 trang)

1. **Home** — Hero với rotating text + capability map grid 4 cards
2. **About** — Câu chuyện cá nhân + skills + interests
3. **Projects** — 6 dự án showcase (3 + 3 layout)
4. **Skills** — Tech stack với progress/level
5. **Credentials** — Chứng chỉ + giải thưởng + giáo dục
6. **Guestbook** — Form + danh sách lời chào
7. **Contact** — Form liên hệ + email + socials

## Structural DNA: **Two-Pane Permanent Split** (mượn từ mẫu)

Trang chính có sidebar navigation cố định bên trái + content stage bên phải. Header trên cùng với brand mark, language switcher, social icons. Footer cố định bên dưới.

## Design reference pull

5+ reference sites:
- **irfansabrian.vercel.app** — Paper/ink aesthetic, rotating text, dot field canvas, target cursor
- **cursor.com** — Clean monochromatic, monospace labels, refined micro-interactions
- **vercel.com** — Smooth transitions, mono + sans pairing
- **rauchg.com** — Minimalist dev portfolio, type-driven
- **linear.app** — Capability map grid pattern
- **stripe.com** — Premium subtle animations

## Palette (giữ tone paper/ink của mẫu)

- `--ink`: #111 (dark text)
- `--paper`: #e8e8e5 (warm cream background)
- `--paper-soft`: #f1f1ee (cards)
- `--line`: rgba(17,17,17,0.24) (borders)
- `--panel`: rgba(241,241,238,0.62) (frosted)
- `--accent`: #111 (mono accent)
- `--surface-texture`: dotted noise texture

## Font stack

- **Display:** Bricolage Grotesque (variable, weights 400–800)
- **Mono / labels:** JetBrains Mono (400, 500)

## Nav pattern

- **Header:** Brand mark trái + language switcher + social icons phải (không ba-section mặc định)
- **Side nav:** Vertical list 7 mục (01–07), ẩn trên mobile, dùng MobileStaggeredMenu

## Brand voice

- Ngắn gọn, tự tin, kỹ thuật nhưng dễ hiểu
- Tiếng Việt làm gốc, có EN/JA cho quốc tế
- Không dùng clichés "passionate developer" / "love building"
- Thay vào đó: "Tôi xây full-stack web + AI/automation cho sản phẩm thật"

## Sections — mỗi trang

### Home
- Mono-label: `Portfolio 2026 / full-stack + ai + automation`
- H1: `Hoàng Kim Vĩnh`
- Rotating role text: `full-stack / web / apps`, `ai / agents / pipelines`, `automation / workflows / bots`
- Intro paragraph: ~25 từ
- 2 CTAs: `View Projects` + `Open CV`
- Capability map: 4 cards (Web Core, Automation, AI Layer, Tools)
- Line-art SVG decoration
- Footer: `full-stack web developer` · `ai / automation` · `@catkod`

### About
- Bio dài ~150 từ
- Timeline học vấn + kinh nghiệm
- "Currently working on" panel
- Interests list

### Projects (6 dự án)
1. **CatKod Shop** — E-commerce full-stack (Next.js + Stripe + Postgres)
2. **Smart CV Scanner** — AI-powered CV parser (Python + LLM)
3. **Workflow Bot** — Telegram/Discord automation
4. **GIS Map Tool** — Map-based dashboard
5. **Trading Journal** — Analytics dashboard
6. **Mini CMS** — Headless CMS cho blog

### Skills
- Frontend: React, Next.js, TypeScript, TailwindCSS, Framer Motion
- Backend: Node.js, Python, FastAPI, Express
- Database: PostgreSQL, MongoDB, Redis
- AI/ML: OpenAI API, LangChain, Vector DBs
- Tools: Git, Docker, Vercel, Figma

### Credentials
- Bằng cấp (ĐH Nông Lâm TP.HCM hoặc tương đương)
- Chứng chỉ online
- Workshops/Events

### Guestbook
- Form: name + message
- Hiển thị danh sách local (no backend) với timestamp
- Note: "Saves lời chào của bạn trong localStorage"

### Contact
- Form: name + email + message
- Email: hello@catkod.dev (placeholder)
- Socials: GitHub + LinkedIn (placeholder)

## Specific technical hooks

- **Initial loader:** "Hello" wordmark + scanline animation + dot field
- **Dot field canvas:** mouse-reactive particles ở background
- **Target cursor:** custom cursor với corners, có dot bên trong
- **Rotating text:** cycle qua các role
- **Mobile menu:** Staggered layers với pre-layers
- **Reveal animations:** IntersectionObserver fade-in cho mỗi section

## Motion choreography

1. **Hero entry:** line-art path draw (stroke-dashoffset) + staggered text reveal
2. **Scroll:** reveal-on-scroll với IntersectionObserver
3. **Cursor:** magnetic corners

## Banned moves

- KHÔNG dùng gradient purple/blue (AI cliché)
- KHÔNG hero → 3-column features → testimonials → CTA → footer (mẫu SaaS)
- KHÔNG stock photos
- KHÔNG emoji làm icons
- KHÔNG rounded-xl everywhere

## Render verification checkpoint

- Build `npm run build` phải pass clean
- `npm run dev` phải start không lỗi
- Lighthouse mobile > 90
- Tất cả 7 trang render đúng nội dung