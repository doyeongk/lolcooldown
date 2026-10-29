# Game Logic

## Rules

1. Two abilities are shown side by side (stacked on mobile).
2. Guess whether the right ability's cooldown is higher or lower than the left one's.
3. A correct guess scores 1 point. Ties count as correct.
4. A wrong guess costs one of 3 lives; at 0 lives the game is over.
5. The best score is kept in localStorage (`cooldown-clash-highscore`).

## Difficulty

`src/lib/game/difficulty.ts`, based on the current score:

| Score | Difficulty | Ability rank |
|-------|------------|--------------|
| 0–9 | beginner | Always rank 1 |
| 10–19 | medium | Random: 1–5 for Q/W/E, 1–3 for R |
| 20–29 | hard | Same as medium |
| 30+ | expert | Same as medium |

The cooldown at a rank is `cooldowns[min(rank, cooldowns.length) - 1]`.

## Matching (`generateChain` in `src/lib/data/abilities.ts`)

Each new ability is compared with the one before it, so it:

- **is slot-matched:** true ultimates only face true ultimates, and everything else faces Q/W/E.
  The R of Zoe, Kog'Maw, LeBlanc, Teemo, Corki, Nidalee, Jayce, Anivia and Kha'Zix is a
  transform, toggle or charge ult, so it counts as a basic ability;
- **is never the same ability** as its predecessor;
- **avoids an equal cooldown,** retrying up to 100 times before accepting a tie.
