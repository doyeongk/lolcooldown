<div align="center">

# ⚔️ lolcooldown

**Test your League of Legends knowledge — guess which ability has the lower cooldown.**

[**Play Now →**](https://lolcooldown.com)

<!-- TODO: Replace with gameplay recording (15-30s MP4 showing a few rounds) -->
<!-- Drag-drop an MP4 into this file on GitHub, or use: -->
<!-- https://github.com/doyeongk/lolcooldown/assets/VIDEO_ID -->

https://github.com/user-attachments/assets/REPLACE_WITH_VIDEO_ID

</div>

---

## How It Works

Two abilities appear side by side. The left one shows its cooldown — the right one is hidden. Guess **Higher** or **Lower**. Build a streak, but watch out: three wrong answers and it's game over.

Difficulty scales as your streak grows — from beginner-friendly matchups to expert-level cooldown knowledge.

## Features

- 🎮 **Cooldown Clash** — Higher/Lower guessing with every ability in League
- 📈 **Progressive difficulty** — matchups get harder as your streak grows
- ❤️ **3-life system** — no room for guessing blindly
- ⌨️ **Keyboard controls** — Arrow keys or H/L for fast play
- 📱 **Mobile-first** — optimised for phones with iOS Safari support
- 🏆 **High score tracking** — persistent local leaderboard
- ✨ **Polished UI** — Framer Motion animations, 60fps transitions

## Tech Stack

- **Framework:** Next.js 16 / React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Database:** PostgreSQL + Prisma 7
- **Data:** Community Dragon API
- **Deployment:** Docker + GitHub Actions

## Quick Start

```bash
# Clone and install
git clone https://github.com/doyeongk/lolcooldown.git
cd lolcooldown
npm install

# Start database
docker compose up -d

# Set up environment
cp .env.example .env

# Initialise database
npx prisma db push
npm run db:seed

# Run dev server
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/              # Pages and API routes
│   ├── api/game/     # Round generation endpoint
│   └── play/         # Game pages
├── components/
│   ├── game/         # CooldownClash, SplitPanel, GuessButtons
│   ├── home/         # Landing page components
│   └── ui/           # Shared UI primitives
├── lib/
│   ├── data/         # Ability fetching and caching
│   └── hooks/        # useLocalStorage, useMediaQuery
└── types/            # TypeScript definitions
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:seed` | Seed abilities from Community Dragon |
| `npm run deploy` | Deploy via SSH |

## Data Source

All ability data is sourced from [Community Dragon](https://communitydragon.org/) and seeded into the database on setup.

## Roadmap

- [x] Core gameplay loop
- [x] Progressive difficulty
- [x] Mobile optimisation
- [x] Keyboard controls
- [x] CI/CD pipeline
- [ ] Sound effects

---

<div align="center">

**[Play Now →](https://lolcooldown.com)**

</div>
