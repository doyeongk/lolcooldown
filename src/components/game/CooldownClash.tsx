'use client'

import { useReducer, useEffect, useCallback, useRef, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SplitPanel } from './SplitPanel'
import { VsDivider } from './VsDivider'
import { GuessButtons } from './GuessButtons'
import { ScoreDisplay } from './ScoreDisplay'
import { GameOver } from './GameOver'
import { TransitionOverlay } from './TransitionOverlay'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { useImagePreloader, useImagePreloaderWithState } from '@/lib/hooks/useImagePreloader'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'
import { useReducedMotion } from '@/lib/motion'
import type {
  GameState,
  GameAction,
  GameRound,
  GuessChoice,
  Difficulty,
} from '@/types/game'
import type { Variants, Transition } from 'framer-motion'

const INITIAL_LIVES = 3
const REVEAL_DELAY = 1200
const MOBILE_TRANSITION_DELAY = 350  // 300ms animation + 50ms buffer
const DESKTOP_TRANSITION_DELAY = 400 // 350ms animation + 50ms buffer

// Mobile carousel panel variants for Framer Motion
// Panel positions use transform-based positioning relative to h-1/2 containers:
// - Panel 1 (top): y=0 normally, y=-100% when exiting up
// - Panel 2 (middle): y=100% normally (top-1/2), y=0 when shifting up
// - Panel 3 (bottom): y=200% normally (top-full, hidden), y=100% when entering
const mobileCarouselTransition: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.3,
}

const mobilePanel1Variants: Variants = {
  static: { y: 0, z: 0 },  // z: 0 pre-promotes GPU layer without overriding y
  exit: { y: '-100%' },
}

const mobilePanel2Variants: Variants = {
  static: { y: '100%', z: 0 },
  shift: { y: 0 },
}

const mobilePanel3Variants: Variants = {
  hidden: { y: '200%', z: 0 },
  enter: { y: '100%' },
}

const QUEUE_SIZE = 2  // Keep 2 rounds buffered ahead for image preloading

const initialState: GameState = {
  phase: 'idle',
  score: 0,
  highScore: 0,
  lives: INITIAL_LIVES,
  currentRound: null,
  roundQueue: [],
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
        roundQueue: action.queue,
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
      // Pop next round from queue
      const [nextRound, ...remainingQueue] = state.roundQueue
      const newLeft = state.currentRound?.right
      const newRight = nextRound?.left

      if (!newLeft || !newRight) {
        // Fallback if queue is empty (shouldn't happen normally)
        return {
          ...state,
          phase: 'playing',
          currentRound: nextRound ?? state.currentRound,
          roundQueue: remainingQueue,
          lastGuessCorrect: null,
        }
      }

      return {
        ...state,
        phase: 'playing',
        currentRound: { left: newLeft, right: newRight },
        roundQueue: remainingQueue,
        lastGuessCorrect: null,
      }
    }

    case 'QUEUE_ROUNDS':
      return { ...state, roundQueue: [...state.roundQueue, ...action.rounds] }

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
  const [sessionStartHighScore, setSessionStartHighScore] = useState<number>(storedHighScore)
  const isFetchingRef = useRef(false)
  const prevPhaseRef = useRef<string>(state.phase)
  const [animatedRoundId, setAnimatedRoundId] = useState<string | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const isMobile = useIsMobile()
  const prefersReducedMotion = useReducedMotion()

  // Generate stable ID for current round
  const currentRoundId = state.currentRound
    ? `${state.currentRound.left.ability.id}-${state.currentRound.right.ability.id}`
    : null

  // Check if this is a NEW round (different from what we last animated)
  const isNewRound = currentRoundId !== animatedRoundId

  // Skip animation if:
  // 1. Same round we already processed, OR
  // 2. New round but coming from transitioning phase (carousel already animated)
  const skipPanelAnimation = !isNewRound ||
    (isNewRound && prevPhaseRef.current === 'transitioning')

  // Detect snap-back: just transitioned from 'transitioning' to 'playing'
  // Must be calculated BEFORE updating prevPhaseRef to capture the transition
  const isSnapBack = prevPhaseRef.current === 'transitioning' && state.phase === 'playing'

  // Update tracking state synchronously during render (React 19 pattern for derived state)
  // This replaces getDerivedStateFromProps - safe because we check for changes first
  if (isNewRound && state.phase === 'playing' && animatedRoundId !== currentRoundId) {
    setAnimatedRoundId(currentRoundId)
  }

  // Preload current round images into browser cache
  const currentRoundImages = useMemo(() => {
    if (!state.currentRound) return []
    const { left, right } = state.currentRound
    return [
      left.ability.champion.splash,
      left.ability.champion.icon,
      left.ability.icon,
      right.ability.champion.splash,
      right.ability.champion.icon,
      right.ability.icon,
    ]
  }, [state.currentRound])

  // Preload all queued round images into browser cache (2 rounds ahead)
  const queuedRoundImages = useMemo(() => {
    if (state.roundQueue.length === 0) return []
    return state.roundQueue.flatMap(({ left, right }) => [
      left.ability.champion.splash,
      left.ability.champion.icon,
      left.ability.icon,
      right.ability.champion.splash,
      right.ability.champion.icon,
      right.ability.icon,
    ])
  }, [state.roundQueue])

  // Only use loading state for initial load - after that, images are preloaded
  const currentImagesLoaded = useImagePreloaderWithState(currentRoundImages)
  useImagePreloader(queuedRoundImages)

  // Handle initial load: wait for first round images, then show content permanently
  useEffect(() => {
    // Only run this logic during initial load
    if (initialLoadComplete) return

    if (currentImagesLoaded && state.currentRound) {
      // Delay showing content to ensure opacity 0 is painted first
      // This guarantees the fade-in animation plays even when images are cached
      const rafId = requestAnimationFrame(() => {
        setShowContent(true)
        setInitialLoadComplete(true)
      })
      return () => cancelAnimationFrame(rafId)
    }
  }, [currentImagesLoaded, state.currentRound, initialLoadComplete])

  // Sync high score from localStorage on mount
  useEffect(() => {
    if (storedHighScore > 0) {
      dispatch({ type: 'SET_HIGH_SCORE', highScore: storedHighScore })
      // Also sync sessionStartHighScore on initial load (when it's still 0)
      setSessionStartHighScore(prev => prev === 0 ? storedHighScore : prev)
    }
  }, [storedHighScore])

  // Update localStorage when high score changes
  useEffect(() => {
    if (state.highScore > storedHighScore) {
      setStoredHighScore(state.highScore)
    }
  }, [state.highScore, storedHighScore, setStoredHighScore])

  // Update prevPhaseRef AFTER render commits
  // This prevents race conditions where setAnimatedRoundId triggers a re-render
  // and the ref is already updated before the second render's isSnapBack check
  useEffect(() => {
    prevPhaseRef.current = state.phase
  }, [state.phase])

  // Start game
  const startGame = useCallback(async () => {
    try {
      const rounds = await fetchRounds(0, 1 + QUEUE_SIZE)  // 1 current + queue
      dispatch({ type: 'START_GAME', round: rounds[0], queue: rounds.slice(1) })
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

  // Handle transition timing (desktop only - mobile uses onAnimationComplete)
  useEffect(() => {
    if (state.phase === 'transitioning' && !isMobile) {
      const timer = setTimeout(() => {
        dispatch({ type: 'TRANSITION_COMPLETE' })
      }, DESKTOP_TRANSITION_DELAY)
      return () => clearTimeout(timer)
    }
  }, [state.phase, isMobile])

  // Keep queue filled with QUEUE_SIZE rounds ahead
  useEffect(() => {
    const queueDeficit = QUEUE_SIZE - state.roundQueue.length
    if (state.phase === 'playing' && queueDeficit > 0 && !isFetchingRef.current) {
      isFetchingRef.current = true
      fetchRounds(state.score, queueDeficit)
        .then((rounds) => {
          dispatch({ type: 'QUEUE_ROUNDS', rounds })
        })
        .catch(console.error)
        .finally(() => {
          isFetchingRef.current = false
        })
    }
  }, [state.phase, state.roundQueue.length, state.score])

  const handleRestart = useCallback(() => {
    // Capture current high score as the baseline for next session
    setSessionStartHighScore(storedHighScore)
    // Reset loading states for new game
    setInitialLoadComplete(false)
    setShowContent(false)
    dispatch({ type: 'RESTART' })
  }, [storedHighScore])

  const isRevealing = state.phase === 'revealing' || state.phase === 'transitioning'
  const isNewHighScore = state.score === state.highScore && state.score > storedHighScore

  // Show overlay-only when no content ready yet
  if (state.phase === 'idle' || !state.currentRound) {
    return <TransitionOverlay prefersReducedMotion={prefersReducedMotion ?? false} />
  }

  return (
    <>
      {/* Game content - starts invisible, fades in when ready */}
      <motion.div
      className="relative h-full w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: showContent ? 1 : 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header - minimal floating bar */}
      <header className="absolute top-0 left-0 right-0 z-30 px-3 md:px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          {/* Back button - circular */}
          <Link
            href="/"
            className="
              flex items-center justify-center
              w-9 h-9 md:w-10 md:h-10
              rounded-full
              bg-black/50 backdrop-blur-md
              border border-gold/20
              text-foreground/60 hover:text-foreground
              hover:border-gold/40
              transition-colors duration-200
            "
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Link>

          <ScoreDisplay
            score={state.score}
            highScore={sessionStartHighScore}
            lives={state.lives}
          />

          <div className="w-9 md:w-10" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Split container */}
      <div
        className="flex flex-col md:flex-row h-full w-full"
        style={{ perspective: '1000px' }}
        role="region"
        aria-label="Ability comparison"
      >
        {isMobile ? (
          // Mobile: Stable 3-panel DOM structure with Framer Motion animations
          <div className="relative h-full w-full overflow-hidden">
            {/* Panel 1: Top (exits during transition) */}
            <motion.div
              className="absolute inset-x-0 h-1/2"
              style={{ top: 0 }}
              variants={mobilePanel1Variants}
              initial={false}
              animate={
                !isSnapBack && state.phase === 'transitioning' && state.roundQueue[0]
                  ? 'exit'
                  : 'static'
              }
              transition={isSnapBack ? { duration: 0 } : (prefersReducedMotion ? { duration: 0 } : mobileCarouselTransition)}
            >
              <SplitPanel
                gameAbility={state.currentRound.left}
                showCooldown={true}
                side="left"
                isCorrect={null}
                skipAnimation={skipPanelAnimation}
              />
            </motion.div>

            {/* Panel 2: Middle (shifts up during transition) */}
            <motion.div
              className="absolute inset-x-0 h-1/2"
              style={{ top: 0 }}
              variants={mobilePanel2Variants}
              initial={false}
              animate={
                !isSnapBack && state.phase === 'transitioning' && state.roundQueue[0]
                  ? 'shift'
                  : 'static'
              }
              transition={isSnapBack ? { duration: 0 } : (prefersReducedMotion ? { duration: 0 } : mobileCarouselTransition)}
              onAnimationComplete={(definition) => {
                // Only fire when shifting animation completes (not on mount or snap-back)
                if (definition === 'shift' && state.phase === 'transitioning') {
                  dispatch({ type: 'TRANSITION_COMPLETE' })
                }
              }}
            >
              <SplitPanel
                gameAbility={state.currentRound.right}
                showCooldown={isRevealing}
                side="right"
                isCorrect={isRevealing ? state.lastGuessCorrect : null}
                onGuess={handleGuess}
                guessDisabled={state.phase !== 'playing'}
                skipAnimation={skipPanelAnimation}
              />
            </motion.div>

            {/* Panel 3: Bottom (enters during transition, hidden otherwise) */}
            <motion.div
              className={`absolute inset-x-0 h-1/2 ${
                !(state.phase === 'transitioning' && state.roundQueue[0])
                  ? 'pointer-events-none'
                  : ''
              }`}
              style={{ top: 0 }}
              variants={mobilePanel3Variants}
              initial={false}
              animate={
                !isSnapBack && state.phase === 'transitioning' && state.roundQueue[0]
                  ? 'enter'
                  : 'hidden'
              }
              transition={isSnapBack ? { duration: 0 } : (prefersReducedMotion ? { duration: 0 } : mobileCarouselTransition)}
            >
              {state.roundQueue[0] ? (
                <SplitPanel
                  gameAbility={state.roundQueue[0].left}
                  showCooldown={false}
                  side="right"
                  isCorrect={null}
                  skipAnimation={true}
                  onGuess={handleGuess}
                  guessDisabled={true}
                />
              ) : (
                // Placeholder panel when queue is empty (rare edge case)
                <div className="h-full bg-dark-blue" />
              )}
            </motion.div>
          </div>
        ) : (
          // Desktop: Unified rendering for both transitioning and normal states
          // Using stable keys prevents remounting when phase changes
          <>
            {/* Exiting left panel - only visible during transition */}
            {state.phase === 'transitioning' && state.roundQueue[0] && (
              <div className="absolute inset-y-0 left-0 w-1/2 z-10 gpu-accelerated">
                <SplitPanel
                  gameAbility={state.currentRound.left}
                  showCooldown={true}
                  side="left"
                  isCorrect={null}
                  exitAnimation="left"
                />
              </div>
            )}

            {/* Left panel - stable across phase changes */}
            <SplitPanel
              key={`left-${state.phase === 'transitioning' && state.roundQueue[0] ? state.currentRound.right.ability.id : state.currentRound.left.ability.id}`}
              gameAbility={state.phase === 'transitioning' && state.roundQueue[0] ? state.currentRound.right : state.currentRound.left}
              showCooldown={true}
              side="left"
              isCorrect={state.phase === 'transitioning' ? state.lastGuessCorrect : null}
              enterAnimation={state.phase === 'transitioning' && state.roundQueue[0] ? 'shift-left' : undefined}
              skipAnimation={state.phase !== 'transitioning' ? skipPanelAnimation : undefined}
            />

            {/* VS divider - zero-height/width flex item */}
            <div className="relative z-20 flex items-center justify-center h-0 md:h-auto md:w-0 shrink-0">
              <VsDivider />
            </div>

            {/* Right panel - stable across phase changes */}
            <SplitPanel
              key={`right-${state.phase === 'transitioning' && state.roundQueue[0] ? state.roundQueue[0].left.ability.id : state.currentRound.right.ability.id}`}
              gameAbility={state.phase === 'transitioning' && state.roundQueue[0] ? state.roundQueue[0].left : state.currentRound.right}
              showCooldown={state.phase === 'transitioning' ? false : isRevealing}
              side="right"
              isCorrect={state.phase === 'transitioning' ? null : (isRevealing ? state.lastGuessCorrect : null)}
              onGuess={handleGuess}
              guessDisabled={state.phase !== 'playing'}
              enterAnimation={state.phase === 'transitioning' && state.roundQueue[0] ? 'right' : undefined}
              skipAnimation={state.phase !== 'transitioning' ? skipPanelAnimation : undefined}
            />
          </>
        )}
      </div>

      {/* Mobile guess buttons - fixed at bottom, hidden on desktop via CSS */}
      <GuessButtons
        variant="fixed"
        onGuess={handleGuess}
        disabled={state.phase !== 'playing'}
        hidden={isRevealing}
      />

      <GameOver
        open={state.phase === 'gameover'}
        score={state.score}
        highScore={state.highScore}
        isNewHighScore={isNewHighScore}
        onRestart={handleRestart}
      />
    </motion.div>

      {/* Transition overlay - exits when content ready */}
      <AnimatePresence>
        {!showContent && (
          <TransitionOverlay prefersReducedMotion={prefersReducedMotion ?? false} />
        )}
      </AnimatePresence>
    </>
  )
}
