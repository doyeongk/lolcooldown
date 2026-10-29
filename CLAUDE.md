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
- `src/lib/` — Utilities, hooks, data fetching
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
- **State management:** one `useReducer` in `CooldownClash.tsx` — see `docs/architecture.md`
- **Styling:** Tailwind CSS 4 + CSS variables in `src/app/globals.css`
- **Images:** Locally cached in `public/images/` (downloaded at seed time from CDragon)
- **Caching:** Use `createCachedFetcher()` from `src/lib/data/cache.ts` for server-side data with TTL

## Frontend Design

**Use Emil Kowalski's skills in `.agents/skills/` for all UI and motion work:**
`emil-design-eng` for principles, `animate` to build motion, `review-animations` to review it,
and `improve-animations` to audit the codebase.

### Principles

Minimalism, simplicity, elegance. Dark blue + gold palette inspired by League of Legends.

### Stack

| Layer | Technology |
|-------|------------|
| Components | Shadcn/ui (Radix primitives) |
| Styling | Tailwind CSS 4 + CSS variables |
| Animation | CSS transitions and keyframes (`globals.css`) |
| Icons | Lucide React |

### Key Rules

- Use existing Shadcn/ui components from `src/components/ui/` first
- Animate with CSS using the `--ease-out` / `--ease-drawer` tokens; keep the `prefers-reduced-motion` block in `globals.css` up to date
- Extend components with CVA variants; use `cn()` for conditional classes
- Test on mobile Safari (most restrictive environment)

## Gotchas

- **iOS Safari:** Use `svh`/`dvh` units for viewport height, not `vh`
- **Prisma:** `source .env` won't work; must use `export` — see `.claude/rules/prisma.md`
- **Images:** Core images cached locally; non-base skins still load from `raw.communitydragon.org`

## Validation

After changes:
1. Run `npm run dev` and open affected page in browser
2. Verify functionality works (not just build passing)
3. Check browser console for errors

For UI changes, describe what you see or ask the user to verify.

## Rules

Additional conventions in `.claude/rules/`:
- `git-commits.md` — Conventional Commits format, no AI signatures
- `prisma.md` — Database commands and gotchas

## Documentation

Detailed technical docs in `docs/`:
- `architecture.md` — Pages, game state machine, API, data and motion
- `game-logic.md` — Rules, difficulty scaling, ability matching
