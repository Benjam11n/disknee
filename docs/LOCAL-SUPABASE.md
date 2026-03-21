# Local Supabase

This project can run fully against a local Supabase stack instead of the remote hosted instance.

## Prerequisites

- Docker or OrbStack running
- Supabase CLI installed

## Start the stack

```bash
npx supabase start
```

Important local endpoints:

- Studio: `http://127.0.0.1:54323`
- API URL: `http://127.0.0.1:54321`
- Postgres: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

## App environment

For local development, use these values:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
DATABASE_DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<local anon key from `npx supabase status -o env`>"
SUPABASE_SERVICE_ROLE_KEY="<local service role key from `npx supabase status -o env`>"
```

## Initialize the local database

Apply the Prisma schema:

```bash
pnpm exec prisma db push
```

Create the leaderboard views:

```bash
/Applications/Postgres.app/Contents/Versions/latest/bin/psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f prisma/migrations/create-leaderboard-views.sql
```

Seed demo data:

```bash
pnpm run db:seed
```

## Run the app

```bash
pnpm run dev
```

If the app was already running when env values changed, restart it once.
