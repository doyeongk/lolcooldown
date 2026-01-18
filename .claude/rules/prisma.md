# Prisma Rules

## Environment Setup

This project uses `prisma.config.ts` which reads `DATABASE_URL` from the environment. The env var must be **exported** for Prisma CLI commands to work:

```bash
export $(grep DATABASE_URL .env | xargs)
```

## Common Commands

```bash
# Apply schema changes
export $(grep DATABASE_URL .env | xargs) && npx prisma db push

# When dropping columns, use --accept-data-loss
export $(grep DATABASE_URL .env | xargs) && npx prisma db push --accept-data-loss

# Regenerate client after schema changes
npx prisma generate

# Seed database
npx tsx src/scripts/seed.ts
```

## Gotchas

- `source .env` alone won't work - Prisma needs exported vars
- Dropping columns requires explicit `--accept-data-loss` flag
