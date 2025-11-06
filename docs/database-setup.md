# Database Setup Instructions

To set up the database with the new leaderboard views and seed data, follow these steps:

## 1. Reset the Database (if needed)

```bash
npx prisma db push --force-reset
```

## 2. Apply Migrations

```bash
npx prisma db push
```

This will create the tables and views based on the updated schema.

## 3. Seed the Database

```bash
npx prisma db seed
```

Or if you have a seed script:

```bash
npm run seed
```

## What Changed

- Removed static `rank` field from leaderboard table
- Added `accuracyPercentage` (renamed from `percent`)
- Added `score` field for points-based ranking
- Created two database views:
  - `leaderboard_by_score`: Ranks users by total score
  - `leaderboard_by_accuracy`: Ranks users by accuracy percentage

## Views Structure

The views automatically calculate ranks using PostgreSQL's `ROW_NUMBER()` window function:

- Score view: `ORDER BY score DESC, name ASC`
- Accuracy view: `ORDER BY accuracyPercentage DESC, name ASC`

## Seeding Data

The seed data includes:

- 6 leaderboard entries with scores calculated (weeks × 100 + accuracy)
- Donald Duck at rank 4321 with low score for demonstration
