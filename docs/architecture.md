# Architecture

## Overview

lolcooldown is a Next.js 16 application using React 19 with server and client components. The game fetches ability data from a PostgreSQL database via Prisma and renders an interactive guessing game.

## Component Hierarchy

```
layout.tsx (Server Component)
└── Providers (Client Component - TooltipProvider)
    └── page.tsx (Server Component)
        └── CooldownClash (Client Component - 'use client')
            ├── TransitionOverlay - Loading state overlay
            ├── Header
            │   ├── Link (Back button)
            │   └── ScoreDisplay
            ├── SplitPanel (left, memo) - Ability display with splash background
            │   ├── AbilityIcon - Icon with tooltip
            │   └── LevelPips - Visual level indicator
            ├── VsDivider - Desktop VS separator
            ├── SplitPanel (right, memo) - Ability with guess interaction
            │   ├── ClickZones (desktop) - Higher/Lower buttons
            │   └── [same children as left]
            ├── GuessButtons (mobile) - Fixed bottom buttons
            └── GameOver (Dialog) - Score display and restart
```

**Performance optimizations:**
- `SplitPanel`, `IconWall`, `GoldParticles` wrapped in `React.memo`
- Animation transition objects defined at module-level to prevent re-creation
- `Providers` component at app root for shared context (TooltipProvider)

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

Images use a global cache with session-wide tracking:

1. **Global preload cache** - Tracks all preloaded URLs this session to avoid redundant work
2. **Current round images** - Blocks UI until loaded (`useImagePreloaderWithState`)
3. **Queued round images** - Loads in background during gameplay (`useBackgroundPreloader`)
4. **decode() API** - Ensures GPU texture is ready before display

**Hooks in `src/lib/hooks/useImagePreloader.ts`:**
- `useImagePreloader(urls)` - Fire-and-forget background preloading
- `useImagePreloaderWithState(urls)` - Returns `boolean` when all images loaded
- `useBackgroundPreloader()` - Returns `{ preload, isReady }` for manual control

## Caching

**Memory cache with TTL (`src/lib/data/cache.ts`):**
- `createCachedFetcher()` wraps database fetchers with 1-hour TTL
- Persists across requests within the same server process
- Combined with React's `cache()` for per-request deduplication
- `clearMemoryCache()` available for forcing refresh after deployment

**React cache():**
- `getValidAbilities()` cached per request lifecycle
- Prevents duplicate database queries within same render

**Browser cache:**
- Images cached via Next.js Image optimization
- Local images in `public/images/` never re-fetched

**localStorage:**
- High score persisted across sessions
- Uses `useSyncExternalStore` for React 19 compatibility
