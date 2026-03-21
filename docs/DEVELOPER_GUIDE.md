# Developer Guide

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma
- PostgreSQL
- Better Auth
- Python pose-detection backend in [`backend/`](../backend)

## Prerequisites

- Node.js 18+
- `pnpm`
- PostgreSQL 14+
- Python 3.11+ for pose-detection work

## Local setup

1. Install dependencies.

```bash
pnpm install
```

2. Create a local `.env` file from the project example and fill in the required values.

```bash
cp .env.example .env
```

3. Generate the Prisma client and sync the database.

```bash
pnpm run db:generate
pnpm run db:push
```

4. Seed demo data if needed.

```bash
pnpm run db:seed
```

5. Start the app.

```bash
pnpm run dev
```

The app runs at `http://localhost:3000`.

## Core commands

- `pnpm run dev` for local development
- `pnpm run lint` to run the repo linter
- `pnpm run type-check` to run TypeScript checks
- `pnpm run format` to apply formatting fixes
- `pnpm run db:generate` to regenerate Prisma client
- `pnpm run db:push` to push schema changes
- `pnpm run db:seed` to seed local data

## Project structure

```text
app/         App Router routes, layouts, and route handlers
components/  Reusable UI and feature components
lib/         Actions, handlers, validations, hooks, utilities, and types
prisma/      Prisma schema, migrations, and seed scripts
backend/     Supplemental backend and pose-detection logic
docs/        Technical and developer documentation
```

## Demo accounts

If you seed the database, these demo users are created:

- `demo@disknee.com` / `demo123`
- `physio@example.com` / `physio2024`

## More technical detail

- App architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- System deep dive: [`TECHNICAL_DEEP_DIVE.md`](TECHNICAL_DEEP_DIVE.md)
- Pose backend: [`../backend/README.md`](../backend/README.md)
