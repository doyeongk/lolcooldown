# State Management

## Game State Machine

The game uses `useReducer` for predictable state transitions through defined phases.

### GamePhase

```
idle → playing → revealing → transitioning → playing (loop)
                          ↘ gameover (if lives = 0)
```

| Phase | Description | Duration |
|-------|-------------|----------|
| `idle` | Initial state, fetching first round | Until fetch completes |
| `playing` | Awaiting user guess | User interaction |
| `revealing` | Showing cooldown values | 1200ms (`TIMING.REVEAL_DELAY`) |
| `transitioning` | Carousel animation | 350-400ms |
| `gameover` | Game ended, dialog shown | Until restart |

### GameState Shape

```typescript
interface GameState {
  phase: GamePhase
  score: number
  highScore: number
  lives: number
  currentRound: GameRound | null
  roundQueue: GameRound[]
  lastGuessCorrect: boolean | null
  difficulty: Difficulty
}
```

## Action Types

```typescript
type GameAction =
  | { type: 'START_GAME'; round: GameRound; queue: GameRound[] }
  | { type: 'GUESS'; choice: GuessChoice }
  | { type: 'REVEAL_COMPLETE' }
  | { type: 'TRANSITION_COMPLETE' }
  | { type: 'QUEUE_ROUNDS'; rounds: GameRound[] }
  | { type: 'RESTART' }
  | { type: 'SET_HIGH_SCORE'; highScore: number }
```

### Action Flow

```
User clicks "Higher" or "Lower"
└── dispatch({ type: 'GUESS', choice })
    └── Reducer calculates isCorrect
    └── Updates score, lives, phase → 'revealing'

setTimeout(REVEAL_DELAY)
└── dispatch({ type: 'REVEAL_COMPLETE' })
    └── If lives > 0: phase → 'transitioning'
    └── If lives = 0: phase → 'gameover'

Animation completes (onAnimationComplete or setTimeout)
└── dispatch({ type: 'TRANSITION_COMPLETE' })
    └── Shifts queue: currentRound.right → left, queue[0].left → right
    └── phase → 'playing'
```

## Round Queue System

Maintains `QUEUE_SIZE = 3` rounds ahead for seamless image preloading.

```
Current: [A, B]
Queue: [[C, D], [E, F], [G, H]]

After transition:
Current: [B, C]
Queue: [[D, E], [F, G]]  // Deficit triggers fetch
```

Queue refill triggers when `roundQueue.length < QUEUE_SIZE` during `playing` phase.

## localStorage Sync

High score persists using a custom `useLocalStorage` hook:

```typescript
const [storedHighScore, setStoredHighScore] = useLocalStorage(
  'cooldown-clash-highscore',
  0
)
```

Uses `useSyncExternalStore` internally for React 19 concurrent rendering safety.

## Session vs Stored High Score

Two high score values:
- `storedHighScore` - From localStorage, updates immediately
- `sessionStartHighScore` - Captured at game start, shown in UI

This prevents the displayed high score from changing mid-game when the player beats it.
