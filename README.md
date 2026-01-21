# lolcooldown

A League of Legends cooldown guessing game.

<!-- Screenshot placeholder: add screenshot.png to repo root or use external URL -->
<!-- ![Screenshot](screenshot.png) -->

**[Play Now →](https://lolcooldown.doyeong.kim)**

## Features

- Cooldown Clash game mode — guess which ability has the lower cooldown
- Streak-based scoring with 3 lives
- Progressive difficulty scaling (beginner → expert)
- High score persistence
- Mobile-optimised with iOS Safari support

## How to Play

1. Two abilities appear side-by-side
2. Left ability shows its cooldown; right is hidden
3. Guess if the right ability's cooldown is Higher or Lower
4. Correct = +1 point; Wrong = lose 1 life
5. 3 wrong answers = game over
6. Difficulty increases as your score rises

## Tech Stack

- Next.js 16 / React 19
- TypeScript
- Tailwind CSS
- PostgreSQL + Prisma 7
- Docker

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Local Development

1. Start PostgreSQL:
   ```bash
   docker compose up -d
   ```

2. Set up environment:
   ```bash
   cp .env.example .env
   ```

3. Initialise database:
   ```bash
   export $(grep DATABASE_URL .env | xargs)
   npx prisma db push
   npm run db:seed
   ```

4. Start dev server:
   ```bash
   npm run dev
   ```

   Open [localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                 # Next.js pages and API routes
│   ├── api/game/        # Game round generation endpoint
│   └── play/            # Game pages
├── components/
│   ├── game/            # CooldownClash, SplitPanel, GuessButtons
│   └── ui/              # Button, LinkButton, Portal
├── lib/
│   ├── data/            # Ability fetching and caching
│   ├── hooks/           # useLocalStorage, useMediaQuery
│   └── db.ts            # Prisma client singleton
├── types/               # TypeScript definitions
└── scripts/             # Database seeding
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `DEPLOY_HOST` | SSH target for deployment (user@host) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed database from Community Dragon |
| `npm run db:studio` | Open Prisma Studio |
| `npm run deploy` | Deploy via SSH |

## Data Source

Ability data sourced from [Community Dragon](https://communitydragon.org/).

## Deployment

1. Create `.env.local`:
   ```bash
   cp .env.local.example .env.local
   # Set DEPLOY_HOST=user@your-server
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```
