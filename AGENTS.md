# AGENTS.md

## Project Overview
- `DisKnee` is a Next.js 16 + TypeScript rehabilitation app.
- UI code lives primarily in `app/` and `components/`.
- Shared utilities, server actions, handlers, and validations live in `lib/`.
- Database-related code lives in `prisma/` and uses Prisma with PostgreSQL.
- There is also a `backend/` directory for supplemental backend or ML-related functionality.

## Working Agreements
- Keep changes focused and minimal; do not refactor unrelated areas.
- Preserve the existing TypeScript, App Router, and Tailwind patterns already used in the repo.
- Prefer server components by default; only use client components when interactivity requires them.
- Reuse existing UI primitives and utilities before introducing new abstractions.
- Do not commit secrets or modify `.env` values directly; update `.env.example` only when introducing new variables.

## Commands
- Install dependencies: `pnpm install`
- Start dev server: `pnpm run dev`
- Lint: `pnpm run lint`
- Type check: `pnpm run type-check`
- Format: `pnpm run format`
- Prisma generate: `pnpm run db:generate`
- Prisma push: `pnpm run db:push`
- Seed database: `pnpm run db:seed`

## Validation
- For small code changes, run the most targeted relevant check first.
- For frontend or shared TypeScript changes, prefer `pnpm run lint` and `pnpm run type-check`.
- For schema or seed changes, include the relevant Prisma command.
- Avoid fixing unrelated failing checks unless the user explicitly asks.

## File Guidance
- `app/`: routes, layouts, pages, and API handlers.
- `components/`: reusable React components and UI composition.
- `lib/`: business logic, helpers, validation, and server-side utilities.
- `prisma/`: schema, migrations, and seed data.
- `docs/`: project documentation.

## Notes for Agents
- Check for nested `AGENTS.md` files before editing subdirectories.
- Prefer `rg` for searching the codebase and keep file reads scoped.
- Update documentation when behavior, setup, or developer workflow changes.
