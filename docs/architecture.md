# Architecture

## Pages

| Route | File | Notes |
|-------|------|-------|
| `/` | `src/app/page.tsx` | Server component. Reads base splashes from the DB, renders `IconWall`, `GoldParticles` and the `HomeScreen` client component. |
| `/play/random` | `src/app/play/random/page.tsx` | Renders `CooldownClash`. |
| `/api/game/random` | `src/app/api/game/random/route.ts` | Returns the next abilities of a game (below). |
| `/images/...` | `src/app/images/[...path]/route.ts` | Serves images the seed downloaded after the server started; Next only snapshots `public/` at boot. |

## Game state

`src/components/game/CooldownClash.tsx` owns the whole game in one `useReducer`.
A game is a **chain** of abilities. Round *n* compares `chain[index]` (left/top) with
`chain[index + 1]` (right/bottom); after the reveal the track slides one panel along
and `index` advances, so the right ability becomes the left one.

```
loading → guessing → revealed → sliding → guessing …
                         ↘ over (no lives left) → restart → guessing
```

- `guess` scores the round (ties count as correct) and moves to `revealed`.
- After `REVEAL_MS`, `next` either ends the game or starts the slide; with
  reduced motion it advances instantly.
- The slide is a CSS transform on a three-panel track; `transitionend` dispatches
  `advance`, which moves `index` and clears the transform in the same render.
- The chain is topped up in the background so at least `BUFFER` abilities are
  always loaded ahead. During game over the next game's chain is prefetched, so
  Try Again is instant.

## API: `GET /api/game/random`

| Param | Default | Meaning |
|-------|---------|---------|
| `score` | `0` | Sets difficulty (`src/lib/game/difficulty.ts`) |
| `count` | `4` | Abilities to return, clamped to 1–10 |
| `after`, `afterCooldown` | – | Last ability the client holds, so the first new one is slot-matched to it and avoids a tie |

Malformed numbers fall back to defaults. Response: `{ abilities: GameAbility[] }`
(see `src/types/game.ts`). Only the rolled cooldown for each ability is sent, not
its per-rank table; scoring is client-side, so that one value is visible in the
network tab.

Abilities are read once per hour through `createCachedFetcher` (`src/lib/data/cache.ts`).

## Data

`src/scripts/seed.ts` pulls champions, abilities and skins from Community Dragon
into Postgres (`prisma/schema.prisma`) and caches icons, base splashes and tiles in
`public/images/`. Non-base skin splashes load from `raw.communitydragon.org`.
Re-running the seed picks up new champions and skins without a rebuild
(`.github/workflows/reseed.yml` does this on a schedule in production).

## Motion

All motion is CSS: keyframes and `@utility` classes in `src/app/globals.css`, with
the `--ease-out` and `--ease-drawer` curves. The `prefers-reduced-motion` block at
the end of that file turns movement off and keeps short opacity fades. Follow the
Emil Kowalski skills in `.agents/skills/` when adding or changing motion.
