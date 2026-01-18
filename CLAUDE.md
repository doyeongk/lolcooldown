# lolcooldown

A League of Legends cooldown guessing game.

## Tech Stack
- Next.js + React
- PostgreSQL
- Google OAuth authentication

## Game Modes

### 1. Cooldown Clash (Comparison Mode)
Two champion abilities shown side-by-side. Guess which has the lower cooldown.
- Streak-based scoring
- 3 wrong answers = game over

**Difficulty Levels:**
- Beginner: Level 1 abilities only
- Medium: Abilities at different levels
- Hard: Levels + items affecting cooldowns
- Expert: Levels + items + runes

### 2. Cooldown Guess (TBD)
Brother designing this mode.

## Data Source
Champion data from [Community Dragon](https://communitydragon.org). Seed with `npx tsx src/scripts/seed.ts`.

## Frontend
- Colours: CSS variables in `src/app/globals.css`
- Buttons: `src/components/ui/`
- Follow web-design-guidelines and vercel-react-best-practices skills
