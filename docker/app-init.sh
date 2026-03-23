#!/bin/sh
set -eu

echo "Waiting for PostgreSQL..."
until pg_isready -h db -p 5432 -U postgres >/dev/null 2>&1; do
  sleep 2
done

echo "Waiting for Supabase API gateway..."
until curl -fsS http://kong:8000/auth/v1/health >/dev/null 2>&1; do
  sleep 2
done

echo "Generating Prisma client..."
pnpm prisma generate

echo "Pushing Prisma schema..."
pnpm prisma db push --skip-generate

echo "Applying leaderboard views..."
pnpm prisma db execute --schema prisma/schema.prisma --file prisma/migrations/create-leaderboard-views.sql

echo "Seeding demo data..."
pnpm run db:seed
