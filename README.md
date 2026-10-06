# My Portfolio (CatKod)

Multi-language (VI / EN / ja) personal portfolio site for **Hoàng Kim Vĩnh** — Embedded & AIoT Engineer.

This repository is intentionally kept minimal at creation. Content, design, and tooling are added in follow-up commits.

## Goals

- Single-page portfolio, single-page load experience.
- Trilingual content: English (default), Vietnamese, and Japanese.
- Static-export friendly (no server runtime required).
- Lighthouse-first: fast, accessible, low JS.

## Tech stack (proposed)

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** (strict)
- **CSS Modules** + a small set of CSS variables (no Tailwind)
- **Static export** (`output: 'export'`, `basePath: '/My_Portfolio_CatKod'`)
- **Vercel** for hosting (workflow included)

## Deploy

Every push to `main` triggers the Vercel deploy workflow defined in `.github/workflows/vercel-deploy.yml`. Configure the required secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) in the repository settings.

## Roadmap

- [ ] Add `next.config.mjs`, `package.json`, `tsconfig.json`
- [ ] Scaffold `src/app` with locale routing (`/[lang]/page.tsx`)
- [ ] i18n message catalogs under `src/messages/{en,vi,ja}.json`
- [ ] Reusable section components (Hero, About, Work, Industrial, Toolchain, Certs, Contact)
- [ ] SEO: per-locale `metadata`, OG images, `hreflang`
- [ ] Accessibility audit (axe / Lighthouse)

## License

MIT — see `LICENSE`.