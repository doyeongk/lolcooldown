# Documentation

Technical documentation for lolcooldown - a League of Legends cooldown guessing game.

## Contents

- [Architecture](./architecture.md) - System overview, component hierarchy, data flow
- [State Management](./state-management.md) - Game reducer pattern, phase machine, actions
- [Animation System](./animation-system.md) - Framer Motion patterns, presets, accessibility
- [Game Logic](./game-logic.md) - Rules, scoring, difficulty scaling, special champions
- [API Reference](./api-reference.md) - `/api/game/random` endpoint documentation
- [UI Components](./ui-components.md) - Shadcn/ui patterns, CVA variants, theming

## Quick Links

| Topic | Key Files |
|-------|-----------|
| Game state | `src/components/game/CooldownClash.tsx` |
| Animations | `src/lib/motion/variants.ts`, `src/lib/motion/timing.ts` |
| Data fetching | `src/lib/data/abilities.ts` |
| API routes | `src/app/api/game/random/route.ts` |
| UI components | `src/components/ui/` |
