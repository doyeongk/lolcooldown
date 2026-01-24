# Architecture

## Overview

lolcooldown is a Next.js 16 application using React 19 with server and client components. The game fetches ability data from a PostgreSQL database via Prisma and renders an interactive guessing game.

## Component Hierarchy

```
page.tsx (Server Component)
└── CooldownClash (Client Component - 'use client')
    ├── TransitionOverlay - Loading state overlay
    ├── Header
    │   ├── Link (Back button)
    │   └── ScoreDisplay
    ├── SplitPanel (left) - Ability display with splash background
    │   ├── AbilityIcon - Icon with tooltip
    │   └── LevelPips - Visual level indicator
    ├── VsDivider - Desktop VS separator
    ├── SplitPanel (right) - Ability with guess interaction
    │   ├── ClickZones (desktop) - Higher/Lower buttons
    │   └── [same children as left]
    ├── GuessButtons (mobile) - Fixed bottom buttons
    └── GameOver (Dialog) - Score display and restart
```

## Client vs Server Boundaries

**Server Components:**
- `page.tsx` files - Static shell, metadata
- API routes - Data fetching from database

**Client Components:**
- `CooldownClash` and all game UI - Interactive state
- Uses `'use client'` directive
- Cannot import server-only modules (Prisma, pg)

## Data Flow

```
1. Page load
   └── CooldownClash mounts
       └── useEffect triggers startGame()
           └── fetch('/api/game/random')

2. API route handler
   └── getValidAbilities() (React cache)
       └── Prisma query → abilities with champions
   └── generateRound() → GameRound

3. Client receives GameRound
   └── dispatch({ type: 'START_GAME', round, queue })
   └── Image preloader begins
       └── Current round: blocking (shows loading)
       └── Queue: background (non-blocking)
```

## Image Preloading Strategy

Images use a queue-based preloader with GPU readiness:

1. **Current round images** - Blocks UI until loaded
2. **Queued round images** - Loads in background during gameplay
3. **decode() API** - Ensures GPU texture is ready before display

Key files:
- `src/lib/hooks/useImagePreloader.ts`
- `src/lib/hooks/useImagePreloaderWithState.ts`

## Caching

**React cache():**
- `getValidAbilities()` cached per request lifecycle
- Prevents duplicate database queries within same render

**Browser cache:**
- Images cached via Next.js Image optimization
- Local images in `public/images/` never re-fetched

**localStorage:**
- High score persisted across sessions
- Uses `useSyncExternalStore` for React 19 compatibility
