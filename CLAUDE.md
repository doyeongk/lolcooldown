# lolcooldown

A League of Legends cooldown guessing game.

## Tech Stack
- Next.js + React
- PostgreSQL
- Google OAuth authentication
- Riot API for champion/ability data
- Deployed on home server with Apache

## Game Modes

### 1. Cooldown Clash (Comparison Mode)
Two champion abilities shown side-by-side. Guess which has the lower cooldown.
- Streak-based scoring
- 3 wrong answers = game over
- Score saved to database

**Difficulty Levels:**
- Beginner: Level 1 abilities only
- Medium: Abilities at different levels
- Hard: Levels + items affecting cooldowns
- Expert: Levels + items + runes

### 2. Cooldown Guess (TBD)
Presented with an ability, guess the cooldown. Brother designing this mode.

## Data Source
Champion and ability cooldown data from Riot Games API.
