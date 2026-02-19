# CLAUDE.md

This file provides guidance for AI assistants working on the Clobile codebase.

## Project Overview

Clobile is a Next.js 16 application bootstrapped with `create-next-app`. It uses React 19, TypeScript, and Tailwind CSS v4. The project is in early development (v0.1.0).

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 16.1.6 | React metaframework (App Router) |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Static typing |
| Tailwind CSS | 4.x | Utility-first styling |
| ESLint | 9.x | Linting (flat config format) |
| PostCSS | — | CSS processing via `@tailwindcss/postcss` |

## Directory Structure

```
Clobile/
├── public/               # Static assets (SVGs served at root URL)
├── src/
│   └── app/              # Next.js App Router (all routes live here)
│       ├── fonts/        # Local variable fonts (GeistVF, GeistMonoVF)
│       ├── globals.css   # Global styles and Tailwind imports
│       ├── layout.tsx    # Root layout — sets metadata, fonts, body wrapper
│       └── page.tsx      # Home route (/)
├── eslint.config.mjs     # ESLint flat config (Next.js + TypeScript rules)
├── next.config.ts        # Next.js config (currently minimal/default)
├── postcss.config.mjs    # PostCSS config (Tailwind v4 plugin)
├── tsconfig.json         # TypeScript config (strict mode, path aliases)
└── package.json          # Dependencies and scripts
```

## Development Commands

```bash
npm run dev      # Start development server (hot reload)
npm run build    # Compile production build
npm run start    # Serve the production build
npm run lint     # Run ESLint across the codebase
```

There is no test runner configured. If tests are added, update this file.

## Key Conventions

### File and Naming Conventions

- **React components**: PascalCase (e.g., `Home`, `RootLayout`)
- **Component files**: `.tsx` extension for JSX, `.ts` for pure TypeScript
- **Config files**: `.mjs` for ES module configs, `.ts` for typed configs
- **Stylesheets**: kebab-case (e.g., `globals.css`)
- **Path alias**: `@/*` resolves to `./src/*` — use this instead of relative `../../` imports

### React and Next.js Patterns

- All components in `src/app/` are **Server Components by default**. Add `"use client"` only when browser APIs or interactivity are required.
- **Page components** use default exports; **metadata** is a named export of type `Metadata`.
- **Props** should be typed with `Readonly<>` wrappers for immutability.
- Use Next.js `<Image>` (from `next/image`) for all images — never a bare `<img>` tag.
- Use Next.js `<Link>` (from `next/link`) for internal navigation.

### Styling

- Use **Tailwind utility classes** directly in JSX. Avoid writing custom CSS except in `globals.css` for truly global concerns.
- **Dark mode** is implemented via the `dark:` prefix with a `prefers-color-scheme` media query defined in `globals.css`.
- **Theme tokens** (`--background`, `--foreground`) are defined as CSS custom properties in `globals.css` using Tailwind v4's `@theme inline` syntax.
- **Responsive design** uses Tailwind breakpoint prefixes (`sm:`, `md:`, `lg:`, etc.).

### TypeScript

- **Strict mode** is enabled — avoid `any`, use proper types.
- Import types from `next` (e.g., `import type { Metadata } from "next"`).
- Do not use `require()` — ES module `import/export` only.

### ESLint

The project uses ESLint 9's **flat config** format (`eslint.config.mjs`). Rules include:
- `eslint-config-next/core-web-vitals` — Next.js performance and accessibility rules
- `eslint-config-next/typescript` — TypeScript-specific Next.js rules

Run `npm run lint` before committing. Fix all errors; warnings should be reviewed.

## What Is Not Configured

The following are absent and would need to be set up before the project is production-ready:

- **Tests** — No test runner (Jest, Vitest, Playwright, etc.) is installed.
- **CI/CD** — No GitHub Actions or other pipeline configuration.
- **Database / ORM** — No database, Prisma, or other data layer.
- **Environment variables** — No `.env.example` or documented env requirements (`.env*` files are git-ignored).
- **Authentication** — No auth library or session management.

## Adding New Routes

In the App Router, routes are folder-based under `src/app/`:

```
src/app/about/page.tsx      → /about
src/app/blog/[slug]/page.tsx → /blog/:slug
```

Each route segment needs a `page.tsx` to be publicly accessible. Layouts in `layout.tsx` wrap all child routes.

## Git Workflow

- Active development branch: `claude/add-claude-documentation-z4UlL`
- Main branch: `main`
- Push with: `git push -u origin <branch-name>`
- Keep commits focused and descriptive.
