import { describe, it, expect } from 'vitest'
import { gameReducer, initialState, INITIAL_LIVES } from './reducer'
import type { GameState, GameRound, GameAbility } from '@/types/game'

// Helper to create a mock ability
function createMockAbility(id: number, cooldown: number): GameAbility {
  return {
    ability: {
      id,
      name: `Ability ${id}`,
      description: null,
      slot: 'Q',
      icon: null,
      cooldowns: [cooldown],
      champion: {
        id: 1,
        name: 'Champion',
        icon: '/icon.png',
        splash: '/splash.png',
      },
    },
    level: 1,
    cooldown,
  }
}

// Helper to create a mock round
function createMockRound(leftCooldown: number, rightCooldown: number): GameRound {
  return {
    left: createMockAbility(1, leftCooldown),
    right: createMockAbility(2, rightCooldown),
  }
}

// Helper to create a playing state with a current round
function createPlayingState(
  leftCooldown: number,
  rightCooldown: number,
  overrides: Partial<GameState> = {}
): GameState {
  return {
    ...initialState,
    phase: 'playing',
    currentRound: createMockRound(leftCooldown, rightCooldown),
    lives: INITIAL_LIVES,
    ...overrides,
  }
}

describe('gameReducer', () => {
  describe('initial state', () => {
    it('should have correct initial values', () => {
      expect(initialState).toEqual({
        phase: 'idle',
        score: 0,
        highScore: 0,
        lives: INITIAL_LIVES,
        currentRound: null,
        roundQueue: [],
        lastGuessCorrect: null,
        difficulty: 'beginner',
      })
    })
  })

  describe('START_GAME', () => {
    it('should transition from idle to playing', () => {
      const round = createMockRound(10, 15)
      const queue = [createMockRound(15, 20)]

      const result = gameReducer(initialState, {
        type: 'START_GAME',
        round,
        queue,
      })

      expect(result.phase).toBe('playing')
      expect(result.currentRound).toEqual(round)
      expect(result.roundQueue).toEqual(queue)
    })

    it('should preserve high score from previous state', () => {
      const stateWithHighScore = { ...initialState, highScore: 42 }
      const round = createMockRound(10, 15)

      const result = gameReducer(stateWithHighScore, {
        type: 'START_GAME',
        round,
        queue: [],
      })

      expect(result.highScore).toBe(42)
    })

    it('should reset score and lives', () => {
      const stateWithProgress = {
        ...initialState,
        score: 10,
        lives: 1,
        highScore: 15,
      }
      const round = createMockRound(10, 15)

      const result = gameReducer(stateWithProgress, {
        type: 'START_GAME',
        round,
        queue: [],
      })

      expect(result.score).toBe(0)
      expect(result.lives).toBe(INITIAL_LIVES)
    })
  })

  describe('GUESS', () => {
    describe('correct guesses', () => {
      it('should increment score on correct "higher" guess', () => {
        // Left: 10, Right: 15 -> Right is higher
        const state = createPlayingState(10, 15)

        const result = gameReducer(state, { type: 'GUESS', choice: 'higher' })

        expect(result.score).toBe(1)
        expect(result.lastGuessCorrect).toBe(true)
        expect(result.lives).toBe(INITIAL_LIVES)
      })

      it('should increment score on correct "lower" guess', () => {
        // Left: 15, Right: 10 -> Right is lower
        const state = createPlayingState(15, 10)

        const result = gameReducer(state, { type: 'GUESS', choice: 'lower' })

        expect(result.score).toBe(1)
        expect(result.lastGuessCorrect).toBe(true)
      })

      it('should count ties as correct for any guess', () => {
        // Left: 10, Right: 10 -> Equal
        const state = createPlayingState(10, 10)

        const higherResult = gameReducer(state, { type: 'GUESS', choice: 'higher' })
        expect(higherResult.lastGuessCorrect).toBe(true)
        expect(higherResult.score).toBe(1)

        const lowerResult = gameReducer(state, { type: 'GUESS', choice: 'lower' })
        expect(lowerResult.lastGuessCorrect).toBe(true)
        expect(lowerResult.score).toBe(1)
      })
    })

    describe('incorrect guesses', () => {
      it('should decrement lives on incorrect guess', () => {
        // Left: 10, Right: 15 -> Right is higher, guessing lower is wrong
        const state = createPlayingState(10, 15)

        const result = gameReducer(state, { type: 'GUESS', choice: 'lower' })

        expect(result.lives).toBe(INITIAL_LIVES - 1)
        expect(result.lastGuessCorrect).toBe(false)
        expect(result.score).toBe(0)
      })

      it('should not increment score on incorrect guess', () => {
        const state = createPlayingState(10, 15, { score: 5 })

        const result = gameReducer(state, { type: 'GUESS', choice: 'lower' })

        expect(result.score).toBe(5) // Unchanged
      })
    })

    describe('phase transitions', () => {
      it('should transition to revealing phase', () => {
        const state = createPlayingState(10, 15)

        const result = gameReducer(state, { type: 'GUESS', choice: 'higher' })

        expect(result.phase).toBe('revealing')
      })

      it('should not process guess if not in playing phase', () => {
        const state = createPlayingState(10, 15, { phase: 'revealing' })

        const result = gameReducer(state, { type: 'GUESS', choice: 'higher' })

        expect(result).toBe(state) // Unchanged
      })

      it('should not process guess if no current round', () => {
        const state = { ...initialState, phase: 'playing' as const }

        const result = gameReducer(state, { type: 'GUESS', choice: 'higher' })

        expect(result).toBe(state) // Unchanged
      })
    })

    describe('high score tracking', () => {
      it('should update high score when score exceeds it', () => {
        const state = createPlayingState(10, 15, { score: 10, highScore: 10 })

        const result = gameReducer(state, { type: 'GUESS', choice: 'higher' })

        expect(result.highScore).toBe(11)
      })

      it('should not update high score when score is lower', () => {
        const state = createPlayingState(10, 15, { score: 5, highScore: 20 })

        const result = gameReducer(state, { type: 'GUESS', choice: 'higher' })

        expect(result.highScore).toBe(20)
      })
    })

    describe('difficulty scaling', () => {
      it('should be beginner at score 0-9', () => {
        const state = createPlayingState(10, 15, { score: 8, difficulty: 'beginner' })

        const result = gameReducer(state, { type: 'GUESS', choice: 'higher' })

        expect(result.difficulty).toBe('beginner')
      })

      it('should transition to medium at score 10', () => {
        const state = createPlayingState(10, 15, { score: 9, difficulty: 'beginner' })

        const result = gameReducer(state, { type: 'GUESS', choice: 'higher' })

        expect(result.difficulty).toBe('medium')
      })

      it('should transition to hard at score 20', () => {
        const state = createPlayingState(10, 15, { score: 19, difficulty: 'medium' })

        const result = gameReducer(state, { type: 'GUESS', choice: 'higher' })

        expect(result.difficulty).toBe('hard')
      })

      it('should transition to expert at score 30', () => {
        const state = createPlayingState(10, 15, { score: 29, difficulty: 'hard' })

        const result = gameReducer(state, { type: 'GUESS', choice: 'higher' })

        expect(result.difficulty).toBe('expert')
      })
    })
  })

  describe('REVEAL_COMPLETE', () => {
    it('should transition to transitioning phase when lives remain', () => {
      const state = createPlayingState(10, 15, { phase: 'revealing', lives: 2 })

      const result = gameReducer(state, { type: 'REVEAL_COMPLETE' })

      expect(result.phase).toBe('transitioning')
    })

    it('should transition to gameover phase when no lives remain', () => {
      const state = createPlayingState(10, 15, { phase: 'revealing', lives: 0 })

      const result = gameReducer(state, { type: 'REVEAL_COMPLETE' })

      expect(result.phase).toBe('gameover')
    })
  })

  describe('TRANSITION_COMPLETE', () => {
    it('should shift rounds: right becomes left, queue provides new right', () => {
      const currentRound = createMockRound(10, 15)
      const queuedRound = createMockRound(20, 25)
      const state: GameState = {
        ...initialState,
        phase: 'transitioning',
        currentRound,
        roundQueue: [queuedRound],
      }

      const result = gameReducer(state, { type: 'TRANSITION_COMPLETE' })

      expect(result.phase).toBe('playing')
      expect(result.currentRound?.left.cooldown).toBe(15) // Previous right
      expect(result.currentRound?.right.cooldown).toBe(20) // From queue's left
      expect(result.roundQueue).toHaveLength(0)
      expect(result.lastGuessCorrect).toBeNull()
    })

    it('should handle empty queue gracefully', () => {
      const currentRound = createMockRound(10, 15)
      const state: GameState = {
        ...initialState,
        phase: 'transitioning',
        currentRound,
        roundQueue: [],
      }

      const result = gameReducer(state, { type: 'TRANSITION_COMPLETE' })

      expect(result.phase).toBe('playing')
      // Falls back to keeping current round
      expect(result.currentRound).toBe(currentRound)
    })
  })

  describe('QUEUE_ROUNDS', () => {
    it('should append rounds to existing queue', () => {
      const existingRound = createMockRound(10, 15)
      const newRounds = [createMockRound(20, 25), createMockRound(30, 35)]
      const state = { ...initialState, roundQueue: [existingRound] }

      const result = gameReducer(state, { type: 'QUEUE_ROUNDS', rounds: newRounds })

      expect(result.roundQueue).toHaveLength(3)
      expect(result.roundQueue[0]).toBe(existingRound)
      expect(result.roundQueue[1]).toBe(newRounds[0])
      expect(result.roundQueue[2]).toBe(newRounds[1])
    })
  })

  describe('RESTART', () => {
    it('should reset to initial state but preserve high score', () => {
      const state: GameState = {
        phase: 'gameover',
        score: 15,
        highScore: 20,
        lives: 0,
        currentRound: createMockRound(10, 15),
        roundQueue: [createMockRound(20, 25)],
        lastGuessCorrect: false,
        difficulty: 'hard',
      }

      const result = gameReducer(state, { type: 'RESTART' })

      expect(result.phase).toBe('idle')
      expect(result.score).toBe(0)
      expect(result.highScore).toBe(20) // Preserved
      expect(result.lives).toBe(INITIAL_LIVES)
      expect(result.currentRound).toBeNull()
      expect(result.roundQueue).toEqual([])
      expect(result.lastGuessCorrect).toBeNull()
      expect(result.difficulty).toBe('beginner')
    })
  })

  describe('SET_HIGH_SCORE', () => {
    it('should set the high score', () => {
      const result = gameReducer(initialState, { type: 'SET_HIGH_SCORE', highScore: 42 })

      expect(result.highScore).toBe(42)
    })
  })

  describe('phase machine: guessing -> revealing -> guessing', () => {
    it('should follow the complete phase cycle', () => {
      // Start in idle
      let state = initialState
      expect(state.phase).toBe('idle')

      // Start game -> playing
      state = gameReducer(state, {
        type: 'START_GAME',
        round: createMockRound(10, 15),
        queue: [createMockRound(15, 20)],
      })
      expect(state.phase).toBe('playing')

      // Make guess -> revealing
      state = gameReducer(state, { type: 'GUESS', choice: 'higher' })
      expect(state.phase).toBe('revealing')

      // Reveal complete (with lives) -> transitioning
      state = gameReducer(state, { type: 'REVEAL_COMPLETE' })
      expect(state.phase).toBe('transitioning')

      // Transition complete -> back to playing
      state = gameReducer(state, { type: 'TRANSITION_COMPLETE' })
      expect(state.phase).toBe('playing')
    })

    it('should transition to gameover when lives exhausted', () => {
      let state = createPlayingState(10, 15, { lives: 1 })

      // Incorrect guess (right is higher, guessing lower is wrong)
      state = gameReducer(state, { type: 'GUESS', choice: 'lower' })
      expect(state.lives).toBe(0)
      expect(state.phase).toBe('revealing')

      // Reveal with no lives -> gameover
      state = gameReducer(state, { type: 'REVEAL_COMPLETE' })
      expect(state.phase).toBe('gameover')
    })
  })

  describe('streak tracking (score as streak)', () => {
    it('should accumulate score as a streak of correct answers', () => {
      let state = createPlayingState(10, 15, {
        roundQueue: [
          createMockRound(15, 20),
          createMockRound(20, 25),
          createMockRound(25, 30),
        ],
      })

      // Three correct guesses in a row (all right abilities are higher)
      for (let i = 0; i < 3; i++) {
        state = gameReducer(state, { type: 'GUESS', choice: 'higher' })
        expect(state.score).toBe(i + 1)
        expect(state.lastGuessCorrect).toBe(true)

        state = gameReducer(state, { type: 'REVEAL_COMPLETE' })
        state = gameReducer(state, { type: 'TRANSITION_COMPLETE' })
      }

      expect(state.score).toBe(3)
      expect(state.lives).toBe(INITIAL_LIVES) // No lives lost
    })

    it('should not reset score on wrong answer', () => {
      let state = createPlayingState(10, 15, { score: 5 })

      // Wrong guess
      state = gameReducer(state, { type: 'GUESS', choice: 'lower' })

      expect(state.score).toBe(5) // Score unchanged, not reset
      expect(state.lives).toBe(INITIAL_LIVES - 1)
    })
  })

  describe('edge cases', () => {
    it('should return unchanged state for unknown action', () => {
      const state = createPlayingState(10, 15)

      // @ts-expect-error Testing unknown action
      const result = gameReducer(state, { type: 'UNKNOWN_ACTION' })

      expect(result).toBe(state)
    })
  })
})
