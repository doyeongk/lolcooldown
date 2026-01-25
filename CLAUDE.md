# lolcooldown

League of Legends cooldown guessing game. Next.js 16 + React 19 + PostgreSQL + Prisma 7.

## Quick Start

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
```

## Project Structure

- `src/app/` — Next.js pages and API routes
- `src/components/game/` — Game components (CooldownClash, SplitPanel, etc.)
- `src/components/ui/` — Shadcn/ui (Button, Dialog, Tooltip, Sheet)
- `src/lib/` — Utilities, hooks, data fetching, motion presets
- `public/images/` — Cached CDragon images (gitignored)

See `docs/architecture.md` for component hierarchy and data flow.

## Environment Variables

| Variable | Purpose | Location |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `.env` |
| `DEPLOY_HOST` | SSH target (user@host) | `.env.local` |

## Database

See `.claude/rules/prisma.md` for commands and gotchas.

```bash
npm run db:seed      # Seed from Community Dragon (~36MB images)
npm run db:studio    # Visual database editor
```

## Deployment

```bash
npm run deploy       # Requires DEPLOY_HOST in .env.local
```

Runs `scripts/deploy.sh` which SSHs to server, pulls, builds Docker, and restarts.

## Game Modes

**Cooldown Clash:** Two abilities shown side-by-side. Guess which has the lower cooldown.
- Streak-based scoring, 3 wrong = game over
- Difficulty auto-scales: beginner → medium → hard → expert

See `docs/game-logic.md` for rules and difficulty scaling.

## Code Patterns

- **Client components:** Use `'use client'` directive for interactivity
- **State management:** `useReducer` for complex game state — see `docs/state-management.md`
- **Styling:** Tailwind CSS 4 + CSS variables — see `docs/ui-components.md`
- **Images:** Locally cached in `public/images/` (downloaded at seed time from CDragon)
- **Caching:** Use `createCachedFetcher()` from `src/lib/data/cache.ts` for server-side data with TTL
- **Performance:** Use `React.memo` for expensive components; define transition objects at module level

## Frontend Design

**Use the `frontend-design` skill for all UI work.**

### Principles

Minimalism, simplicity, elegance. Dark blue + gold palette inspired by League of Legends.

### Stack

| Layer | Technology |
|-------|------------|
| Components | Shadcn/ui (Radix primitives) |
| Styling | Tailwind CSS 4 + CSS variables |
| Animation | Framer Motion |
| Icons | Lucide React |

### Key Rules

- Use existing Shadcn/ui components from `src/components/ui/` first
- Use Framer Motion for all animations (not CSS keyframes)
- Extend components with CVA variants; use `cn()` for conditional classes
- Test on mobile Safari (most restrictive environment)

**Detailed docs:** `docs/ui-components.md`, `docs/animation-system.md`

## Gotchas

- **iOS Safari:** Uses `--vh` CSS variable for viewport height (see `ViewportHeight.tsx`)
- **Prisma:** `source .env` won't work; must use `export` — see `.claude/rules/prisma.md`
- **Images:** Core images cached locally; non-base skins still load from `raw.communitydragon.org`

## Testing

```bash
npm test              # Vitest watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
npm run test:e2e      # Playwright E2E
```

- Co-locate unit tests with source: `*.test.ts` next to `*.ts`
- Use `data-testid` for E2E selectors, not CSS classes
- Framer Motion is mocked in `vitest.setup.ts`
- For async Server Components, use Playwright E2E instead of unit tests

**Detailed docs:** `docs/testing/`

## Validation

After changes:
1. Run `npm run test:run` for unit tests
2. Run `npm run dev` and open affected page in browser
3. Verify functionality works (not just build passing)
4. Check browser console for errors

For UI changes, describe what you see or ask the user to verify.

## Rules

Additional conventions in `.claude/rules/`:
- `git-commits.md` — Conventional Commits format, no AI signatures
- `prisma.md` — Database commands and gotchas

## Documentation

Detailed technical docs in `docs/`:
- `architecture.md` — System overview, component hierarchy, data flow
- `state-management.md` — Game reducer pattern, phase machine, actions
- `animation-system.md` — Framer Motion patterns, timing constants
- `game-logic.md` — Rules, difficulty scaling, special champions
- `api-reference.md` — `/api/game/random` endpoint
- `ui-components.md` — Shadcn/ui patterns, CVA variants
- `testing/` — Vitest setup, test strategy, known issues
