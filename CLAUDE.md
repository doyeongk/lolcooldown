# lolcooldown

League of Legends cooldown guessing game. Next.js 16 + React 19 + PostgreSQL + Prisma 7.

## Quick Start

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
```

## Project Structure

```
src/
├── app/             # Next.js pages and API routes
│   ├── api/game/    # Game round generation endpoint
│   └── play/        # Game pages
├── components/
│   ├── game/        # CooldownClash, SplitPanel, GuessButtons, etc.
│   └── ui/          # Button, LinkButton, Portal
├── lib/
│   ├── data/        # Ability fetching and caching
│   ├── hooks/       # useLocalStorage, useMediaQuery, useImagePreloader
│   └── db.ts        # Prisma client singleton
├── types/           # TypeScript definitions
└── scripts/         # Database seeding
```

## Environment Variables

| Variable | Purpose | Location |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `.env` |
| `DEPLOY_HOST` | SSH target (user@host) | `.env.local` |

## Database

See `.claude/rules/prisma.md` for full commands.

**Critical:** Export DATABASE_URL before Prisma CLI commands:
```bash
export $(grep DATABASE_URL .env | xargs) && npx prisma db push
```

Other commands:
```bash
npm run db:seed      # Seed from Community Dragon
npm run db:studio    # Visual database editor
npm run db:generate  # Regenerate Prisma client
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

## Code Patterns

- **Client components:** Use `'use client'` directive for interactivity
- **State management:** `useReducer` for complex game state (see `CooldownClash.tsx`)
- **Styling:** Tailwind CSS; colours in `src/app/globals.css`
- **Images:** CDragon assets via `next/image` (configured in `next.config.ts`)

## Frontend

- Colours: CSS variables in `src/app/globals.css`
- UI components: `src/components/ui/`
- Follow `web-design-guidelines` and `vercel-react-best-practices` skills

## Gotchas

- **iOS Safari:** Uses `--vh` CSS variable for viewport height (see `ViewportHeight.tsx`)
- **Prisma:** `source .env` won't work; must use `export` — see `.claude/rules/prisma.md`
- **Images:** Only `raw.communitydragon.org` allowed in `next/image` remotes

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
