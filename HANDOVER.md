# Database Setup Handover

Context for resuming work on MacBook.

## Current State

- **Branch:** `database`
- **Status:** All files created, Prisma client generated
- **Database:** NOT running (no Docker on this machine)
- **Data:** NOT seeded yet

## Critical Configuration Notes

### Prisma 7 Breaking Change

The database URL is configured in `prisma.config.ts`, NOT in `schema.prisma`. This is required for Prisma 7.x - older tutorials are outdated.

```typescript
// prisma.config.ts
export default defineConfig({
  earlyAccess: true,  // Enables new config format
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Prisma Client Singleton

`src/lib/db.ts` prevents multiple PrismaClient instances during Next.js hot reload. Import from `@prisma/client` (standard location).

## Commands to Run

```bash
# 1. Install dependencies (if node_modules missing)
npm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Push schema to database
npx prisma db push

# 4. Seed champion data (~170 champions, ~20-30 seconds)
npm run db:seed

# 5. Verify with Prisma Studio
npm run db:studio
```

## Data Source

- **API:** Meraki Analytics CDN (more accurate than Data Dragon)
- **Champion list:** `https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions.json`
- **Individual:** `https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions/{Key}.json`
- **Rate limiting:** 100ms between requests

## Expected Seed Output

```
Found ~170 champions to seed
[1/170] ✓ Aatrox
[2/170] ✓ Ahri
...
Seed completed!
  Success: ~170
  Errors: 0

Database totals:
  Champions: ~170
  Abilities: ~850 (5 per champion)
  Skins: ~1300+
```

## Verification Checks

After seeding, verify in Prisma Studio (`npm run db:studio`):

| Champion | Ability | Expected Cooldown (Rank 1) | affectedByCdr |
|----------|---------|---------------------------|---------------|
| Ahri | Q | 7 | true |
| Anivia | Passive | 240 | false |
| Zac | Passive | 300 | false |

## Next Steps After Seeding

1. Create API routes for fetching random ability pairs
2. Build the comparison UI component
3. Add Google OAuth (User/Score tables)

## Troubleshooting

**"Cannot find module '@prisma/client'"**
```bash
npx prisma generate
```

**"Connection refused" on db:push**
```bash
docker compose up -d
```

**"relation does not exist"**
```bash
npx prisma db push  # Run before seeding
```

## Files Created

| File | Purpose |
|------|---------|
| `docker-compose.yml` | PostgreSQL 16 container |
| `prisma.config.ts` | Prisma 7 config |
| `prisma/schema.prisma` | Champion, Ability, Skin models |
| `src/lib/db.ts` | Prisma client singleton |
| `src/scripts/seed.ts` | Meraki data fetcher |
| `.env.example` | Template for DATABASE_URL |
