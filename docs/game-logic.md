# Game Logic

## Game Rules

1. Two abilities shown side-by-side
2. Player guesses if the right ability has a higher or lower cooldown
3. Correct guess: +1 score
4. Wrong guess: -1 life
5. Ties count as correct (same cooldown)
6. Game ends when lives reach 0

## Scoring

- **Starting lives:** 3
- **Score increment:** 1 per correct guess
- **High score:** Persisted in localStorage

## Difficulty Scaling

Difficulty adjusts based on current score:

| Score Range | Difficulty | Ability Levels |
|-------------|------------|----------------|
| 0-9 | beginner | Always level 1 |
| 10-19 | medium | Random 1-5 (Q/W/E) or 1-3 (R) |
| 20-29 | hard | Random 1-5 (Q/W/E) or 1-3 (R) |
| 30+ | expert | Random 1-5 (Q/W/E) or 1-3 (R) |

```typescript
function getDifficultyForScore(score: number): Difficulty {
  if (score < 10) return 'beginner'
  if (score < 20) return 'medium'
  if (score < 30) return 'hard'
  return 'expert'
}
```

Location: `src/lib/game/difficulty.ts`

## Ability Slot Matching

To keep comparisons fair, abilities are matched by slot type:

| Left Ability | Matched With |
|--------------|--------------|
| Q, W, E | Q, W, E + transform ults |
| R (normal) | R only (excluding transform ults) |
| R (transform) | Q, W, E + other transform ults |

## Transform Ultimate Champions

Some champions have R abilities with very short cooldowns (transform/toggle ultimates). These are treated as basic abilities for matching purposes:

```typescript
const TRANSFORM_ULT_CHAMPIONS = [
  'Zoe',        // R returns her to cast position
  "Kog'Maw",    // R is spammable mortar
  'LeBlanc',    // R mimics last ability
  'Teemo',      // R places mushrooms
  'Corki',      // R has charges
  'Nidalee',    // R transforms
  'Jayce',      // R transforms
  'Anivia',     // R toggles
  "Kha'Zix"     // R has charges
]
```

Location: `src/lib/data/abilities.ts`

## Round Generation Rules

When generating a round (`generateRound`):

1. **No self-matches:** Left and right must be different abilities
2. **Slot matching:** Follows rules above
3. **No guaranteed ties:** Attempts to avoid same cooldown (not guaranteed)
4. **Max attempts:** 100 retries before accepting any valid pair

## Cooldown Calculation

Cooldowns vary by ability rank (level):

```typescript
function getCooldownAtLevel(cooldowns: number[], level: number): number {
  const index = Math.min(level - 1, cooldowns.length - 1)
  return cooldowns[index]
}
```

- Level 1 = `cooldowns[0]`
- Level 5 = `cooldowns[4]` (or last available if shorter)

## Queue Continuity

To prevent jarring transitions, the queue system ensures:

1. `excludeId` parameter prevents duplicate abilities in consecutive rounds
2. Right ability of current round becomes left ability of next round
3. Queue refills when below `QUEUE_SIZE = 3`

```
Round N:   [A, B]
Round N+1: [B, C]  ← B carries over
Round N+2: [C, D]  ← C carries over
```
