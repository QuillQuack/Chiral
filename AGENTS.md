# AGENTS.md — r18 Project

## Project
Parody adult game download platform — "Chiral Downloads: Definitely Not a Virus"
Satirical dark-mode website with cyberpunk/SaaS aesthetic.

## Commands
- `npm run dev` — Start dev server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Lint check
- `docker compose up --build` — Full stack (app + PostgreSQL)
- `npx prisma generate` — Regenerate Prisma client after schema changes
- `npx prisma migrate dev --name init` — Create initial DB migration
- `npx tsx prisma/seed.ts` — Seed admin + demo users

## Stack
- Next.js 16 + TypeScript
- Tailwind CSS v4 (CSS-based theme config via `@theme`)
- App Router
- Prisma 7 + PostgreSQL
- Auth.js v5 (next-auth@beta)

## Auth
- Two roles: `USER` (default) and `ADMIN` (manual seed only)
- Login/register at `/login`, `/register`
- Protected routes: `/profile` (any logged-in user), `/admin` (ADMIN only)
- Admin grants role via `prisma/seed.ts` — no promote UI

## Conventions
- **Components**: `src/components/PascalCase.tsx` — default export
- **Data**: `src/data/kebab-case.ts` — named exports
- **API routes**: `src/app/api/[route]/route.ts` — Next.js App Router
- **Types**: `src/types/index.ts` — all shared interfaces
- **Auth types**: `src/types/next-auth.d.ts` — Session/User augmentation
- **Prisma client**: `src/generated/prisma/client` (auto-generated, do not edit)
- **Tailwind**: Custom colors defined in `globals.css` via `@theme inline {}`
  - Use semantic classes: `text-text-primary`, `bg-dark-secondary`, `text-accent-pink`, etc.
  - No arbitrary color values in JSX
- **Formatting**: Single quotes, semicolons, 2-space indent
- **Imports**: React → Next → components → data → types → lib
- **Client components**: Add `"use client"` directive when using hooks or browser APIs
- **No comments** in code unless absolutely necessary
- **No emojis** in code or file content unless user explicitly requests

## Theme Colors (from globals.css)
- `dark-bg`: #0F1115
- `dark-secondary`: #171A21
- `accent-pink`: #FF4FD8
- `accent-cyan`: #6EE7FF
- `text-primary`: #EAEAEA
- `text-secondary`: #9CA3AF
