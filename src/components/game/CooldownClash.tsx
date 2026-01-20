'use client'

import { useReducer, useEffect, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import { SplitPanel } from './SplitPanel'
import { VsDivider } from './VsDivider'
import { MobileGuessButtons } from './MobileGuessButtons'
import { ScoreDisplay } from './ScoreDisplay'
import { GameOver } from './GameOver'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { useImagePreloader } from '@/lib/hooks/useImagePreloader'
import type {
  GameState,
  GameAction,
  GameRound,
  GuessChoice,
  Difficulty,
} from '@/types/game'

const INITIAL_LIVES = 3
const REVEAL_DELAY = 1500
const TRANSITION_DELAY = 800

const initialState: GameState = {
  phase: 'idle',
  score: 0,
  highScore: 0,
  lives: INITIAL_LIVES,
  currentRound: null,
  nextRound: null,
  lastGuessCorrect: null,
  difficulty: 'beginner',
}

function getDifficultyForScore(score: number): Difficulty {
  if (score < 10) return 'beginner'
  if (score < 20) return 'medium'
  if (score < 30) return 'hard'
  return 'expert'
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        phase: 'playing',
        highScore: state.highScore,
        currentRound: action.round,
        nextRound: action.nextRound,
      }

    case 'GUESS': {
      if (!state.currentRound || state.phase !== 'playing') return state

      const { left, right } = state.currentRound
      const rightIsHigher = right.cooldown > left.cooldown
      const rightIsLower = right.cooldown < left.cooldown
      const isEqual = right.cooldown === left.cooldown
      const isCorrect =
        isEqual || // Ties count as correct
        (action.choice === 'higher' && rightIsHigher) ||
        (action.choice === 'lower' && rightIsLower)

      const newScore = isCorrect ? state.score + 1 : state.score
      const newLives = isCorrect ? state.lives : state.lives - 1
      const newHighScore = Math.max(state.highScore, newScore)

      return {
        ...state,
        phase: 'revealing',
        score: newScore,
        lives: newLives,
        highScore: newHighScore,
        lastGuessCorrect: isCorrect,
        difficulty: getDifficultyForScore(newScore),
      }
    }

    case 'REVEAL_COMPLETE':
      if (state.lives <= 0) {
        return { ...state, phase: 'gameover' }
      }
      return { ...state, phase: 'transitioning' }

    case 'TRANSITION_COMPLETE': {
      // Move current right to become new left, use fetched ability as new right
      const newLeft = state.currentRound?.right
      const newRight = action.nextRound?.left

      if (!newLeft || !newRight) {
        // Fallback to old behavior if something goes wrong
        return {
          ...state,
          phase: 'playing',
          currentRound: action.nextRound,
          nextRound: null,
          lastGuessCorrect: null,
        }
      }

      return {
        ...state,
        phase: 'playing',
        currentRound: { left: newLeft, right: newRight },
        nextRound: null,
        lastGuessCorrect: null,
      }
    }

    case 'SET_NEXT_ROUND':
      return { ...state, nextRound: action.round }

    case 'RESTART':
      return { ...initialState, highScore: state.highScore, phase: 'idle' }

    case 'SET_HIGH_SCORE':
      return { ...state, highScore: action.highScore }

    default:
      return state
  }
}

async function fetchRounds(score: number, count = 2): Promise<GameRound[]> {
  const res = await fetch(`/api/game/random?score=${score}&count=${count}`)
  if (!res.ok) throw new Error('Failed to fetch rounds')
  const data = await res.json()
  return data.rounds
}

export function CooldownClash() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [storedHighScore, setStoredHighScore] = useLocalStorage('cooldown-clash-highscore', 0)
  const isFetchingRef = useRef(false)

  // Preload next round images into browser cache
  const nextRoundImages = useMemo(() => {
    if (!state.nextRound) return []
    const { left, right } = state.nextRound
    return [
      left.ability.champion.splash,
      left.ability.champion.icon,
      left.ability.icon,
      right.ability.champion.splash,
      right.ability.champion.icon,
      right.ability.icon,
    ]
  }, [state.nextRound])

  useImagePreloader(nextRoundImages)

  // Sync high score from localStorage on mount
  useEffect(() => {
    if (storedHighScore > 0) {
      dispatch({ type: 'SET_HIGH_SCORE', highScore: storedHighScore })
    }
  }, [storedHighScore])

  // Update localStorage when high score changes
  useEffect(() => {
    if (state.highScore > storedHighScore) {
      setStoredHighScore(state.highScore)
    }
  }, [state.highScore, storedHighScore, setStoredHighScore])

  // Start game
  const startGame = useCallback(async () => {
    try {
      const rounds = await fetchRounds(0, 2)
      dispatch({ type: 'START_GAME', round: rounds[0], nextRound: rounds[1] })
    } catch (error) {
      console.error('Failed to start game:', error)
    }
  }, [])

  // Auto-start on mount
  useEffect(() => {
    if (state.phase === 'idle') {
      startGame()
    }
  }, [state.phase, startGame])

  // Handle guess
  const handleGuess = useCallback((choice: GuessChoice) => {
    dispatch({ type: 'GUESS', choice })
  }, [])

  // Handle reveal timing
  useEffect(() => {
    if (state.phase === 'revealing') {
      const timer = setTimeout(() => {
        dispatch({ type: 'REVEAL_COMPLETE' })
      }, REVEAL_DELAY)
      return () => clearTimeout(timer)
    }
  }, [state.phase])

  // Handle transition timing and pre-fetch
  useEffect(() => {
    if (state.phase === 'transitioning') {
      const timer = setTimeout(async () => {
        // Pre-fetch next round if we don't have one
        let nextRound = state.nextRound
        if (!nextRound && !isFetchingRef.current) {
          isFetchingRef.current = true
          try {
            const rounds = await fetchRounds(state.score, 1)
            nextRound = rounds[0]
          } catch (error) {
            console.error('Failed to fetch next round:', error)
          }
          isFetchingRef.current = false
        }
        dispatch({ type: 'TRANSITION_COMPLETE', nextRound })
      }, TRANSITION_DELAY)
      return () => clearTimeout(timer)
    }
  }, [state.phase, state.nextRound, state.score])

  // Pre-fetch next round when playing
  useEffect(() => {
    if (state.phase === 'playing' && !state.nextRound && !isFetchingRef.current) {
      isFetchingRef.current = true
      fetchRounds(state.score, 1)
        .then((rounds) => {
          dispatch({ type: 'SET_NEXT_ROUND', round: rounds[0] })
        })
        .catch(console.error)
        .finally(() => {
          isFetchingRef.current = false
        })
    }
  }, [state.phase, state.nextRound, state.score])

  const handleRestart = useCallback(() => {
    dispatch({ type: 'RESTART' })
  }, [])

  if (state.phase === 'idle' || !state.currentRound) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-dark-blue">
        <p className="text-foreground text-xl">Loading...</p>
      </div>
    )
  }

  const isRevealing = state.phase === 'revealing' || state.phase === 'transitioning'
  const isNewHighScore = state.score === state.highScore && state.score > storedHighScore

  return (
    <div className="relative h-dvh w-screen overflow-hidden">
      {/* Header - back button and score */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <Link
          href="/"
          className="p-2 rounded-lg bg-dark-blue/80 hover:bg-dark-blue text-foreground transition-colors"
          aria-label="Go back to menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <ScoreDisplay
          score={state.score}
          highScore={state.highScore}
          lives={state.lives}
        />
        <div className="w-9" aria-hidden="true" />
      </header>

      {/* Split container */}
      <div
        className="flex flex-col md:flex-row h-full w-full pb-20 md:pb-0"
        role="region"
        aria-label="Ability comparison"
      >
        {/* Left panel: Known ability (always shows cooldown) */}
        <SplitPanel
          gameAbility={state.currentRound.left}
          showCooldown={true}
          side="left"
          isCorrect={null}
        />

        {/* VS divider - zero-height/width flex item */}
        <div className="relative z-20 flex items-center justify-center h-0 md:h-auto md:w-0 shrink-0">
          <VsDivider />
        </div>

        {/* Right panel: Challenger ability + buttons */}
        <SplitPanel
          gameAbility={state.currentRound.right}
          showCooldown={isRevealing}
          side="right"
          isCorrect={isRevealing ? state.lastGuessCorrect : null}
          onGuess={handleGuess}
          guessDisabled={state.phase !== 'playing'}
        />
      </div>

      {/* Mobile guess buttons - fixed at bottom, hidden on desktop via CSS */}
      {!isRevealing && (
        <MobileGuessButtons onGuess={handleGuess} disabled={state.phase !== 'playing'} />
      )}

      {state.phase === 'gameover' && (
        <GameOver
          score={state.score}
          highScore={state.highScore}
          isNewHighScore={isNewHighScore}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
