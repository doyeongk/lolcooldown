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

## Frontend Design Philosophy

**Use the `frontend-design` skill for all UI work.**

This project emphasises **minimalism, simplicity, elegance, and aesthetics**. Every UI element should feel intentional—no visual clutter, no unnecessary complexity.

### Design Principles

1. **Minimalism** — Only what's needed. Remove before adding.
2. **Simplicity** — If it needs explanation, simplify it.
3. **Elegance** — Smooth transitions, considered spacing, visual harmony.
4. **Aesthetics** — Dark blue + gold palette inspired by League of Legends.

### Stack

| Layer | Technology |
|-------|------------|
| Components | Shadcn/ui (Radix primitives) |
| Styling | Tailwind CSS 4 + CSS variables |
| Animation | Framer Motion + CSS keyframes |
| Icons | Lucide React |

### Reusable Components (`src/components/ui/`)

**Always reuse these components for new features:**

- **Button** — Variant-driven (`primary`, `gold`, `outline`, `ghost`, etc.), multiple sizes, `asChild` slot composition
- **Dialog** — Modal overlay with gold borders, dark-blue background, built-in animations
- **Tooltip** — Hover hints with directional slide animations
- **Sheet** — Slide-out panels

Use `class-variance-authority` (CVA) for new component variants. Use `cn()` from `src/lib/utils.ts` for conditional classnames.

### Animation System (`src/lib/motion/`)

**CSS keyframes** for transitions (performant, stable):
- Panel slides, cooldown reveals, feedback pulses

**Framer Motion** for interactive feedback:
- `fadeIn`, `scaleIn`, `numberPop`, `correctPulse`, `incorrectShake`
- Import from `@/lib/motion`

**Accessibility:** All animations respect `prefers-reduced-motion`.

### Colour Palette (`src/app/globals.css`)

```css
--gold: #e3cf74           /* Primary accent */
--gold-hover: #d4c066     /* Hover state */
--dark-blue: #172b3b      /* Background */
--dark-blue-hover: #1e3a4a
--foreground: #e7e9ea     /* Text */
```

### Mobile Considerations

- Transform-based animations (avoid layout thrashing on iOS Safari)
- Safe area insets for notched devices
- `--vh` CSS variable for viewport height (see `ViewportHeight.tsx`)
- Touch-friendly sizing (44px minimum tap targets)

### Creating New UI

1. Check if an existing component in `src/components/ui/` can be reused or extended
2. Follow Shadcn/ui patterns: Radix primitive → styled wrapper → CVA variants
3. Keep animations subtle and purposeful
4. Test on mobile Safari (most restrictive environment)

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
