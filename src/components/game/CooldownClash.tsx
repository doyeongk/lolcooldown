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
  static: { y: 0 },
  exit: { y: '-100%' },
}

const mobilePanel2Variants: Variants = {
  static: { y: '100%' },
  shift: { y: 0 },
}

const mobilePanel3Variants: Variants = {
  hidden: { y: '200%' },
  enter: { y: '100%' },
}

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
  const [prevPhase, setPrevPhase] = useState<string>(state.phase)
  const [animatedRoundId, setAnimatedRoundId] = useState<string | null>(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)
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
    (isNewRound && prevPhase === 'transitioning')

  // Update tracking state synchronously during render (React 19 pattern for derived state)
  // This replaces getDerivedStateFromProps - safe because we check for changes first
  if (isNewRound && state.phase === 'playing' && animatedRoundId !== currentRoundId) {
    setAnimatedRoundId(currentRoundId)
  }
  if (prevPhase !== state.phase) {
    setPrevPhase(state.phase)
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

  const currentImagesLoaded = useImagePreloaderWithState(currentRoundImages)
  useImagePreloader(nextRoundImages)

  // Reset loaded state when round changes
  useEffect(() => {
    if (!currentImagesLoaded) {
      setImagesLoaded(false)
    } else if (currentImagesLoaded && state.currentRound) {
      setImagesLoaded(true)
    }
  }, [currentImagesLoaded, state.currentRound])

  // Delay showing content to ensure opacity 0 is painted first
  // This guarantees the fade-in animation plays even when images are cached
  useEffect(() => {
    if (imagesLoaded) {
      const rafId = requestAnimationFrame(() => {
        setShowContent(true)
      })
      return () => cancelAnimationFrame(rafId)
    } else {
      setShowContent(false)
    }
  }, [imagesLoaded])

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
      const transitionDelay = isMobile ? MOBILE_TRANSITION_DELAY : DESKTOP_TRANSITION_DELAY
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
      }, transitionDelay)
      return () => clearTimeout(timer)
    }
  }, [state.phase, state.nextRound, state.score, isMobile])

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
      {/* Header - back button and score */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        {/* Header backdrop gradient */}
        <div
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 70%, transparent 100%)',
          }}
        />
        <motion.div
          whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <Link
            href="/"
            className="block p-2 rounded-lg bg-gradient-to-b from-black/50 to-black/60 hover:from-black/60 hover:to-black/70 backdrop-blur-sm text-foreground transition-all border border-gold/30 hover:shadow-[0_0_12px_rgba(227,207,116,0.2)]"
            aria-label="Go back to menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </motion.div>
        <ScoreDisplay
          score={state.score}
          highScore={state.highScore}
          lives={state.lives}
        />
        <div className="w-9" aria-hidden="true" />
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
                state.phase === 'transitioning' && state.nextRound
                  ? 'exit'
                  : 'static'
              }
              transition={prefersReducedMotion ? { duration: 0 } : mobileCarouselTransition}
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
                state.phase === 'transitioning' && state.nextRound
                  ? 'shift'
                  : 'static'
              }
              transition={prefersReducedMotion ? { duration: 0 } : mobileCarouselTransition}
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

            {/* VS divider */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center h-0 shrink-0">
              <VsDivider />
            </div>

            {/* Panel 3: Bottom (enters during transition, hidden otherwise) */}
            <motion.div
              className={`absolute inset-x-0 h-1/2 ${
                !(state.phase === 'transitioning' && state.nextRound)
                  ? 'pointer-events-none'
                  : ''
              }`}
              style={{ top: 0 }}
              variants={mobilePanel3Variants}
              initial={false}
              animate={
                state.phase === 'transitioning' && state.nextRound
                  ? 'enter'
                  : 'hidden'
              }
              transition={prefersReducedMotion ? { duration: 0 } : mobileCarouselTransition}
            >
              {state.nextRound ? (
                <SplitPanel
                  gameAbility={state.nextRound.left}
                  showCooldown={false}
                  side="right"
                  isCorrect={null}
                  skipAnimation={true}
                  onGuess={handleGuess}
                  guessDisabled={true}
                />
              ) : (
                // Placeholder panel when nextRound not yet loaded
                <div className="h-full bg-dark-blue" />
              )}
            </motion.div>
          </div>
        ) : state.phase === 'transitioning' && state.nextRound ? (
          // Desktop: Carousel slide transition
          <>
            {/* Exiting left - slides out to left */}
            <div className="absolute inset-y-0 left-0 w-1/2 z-10 gpu-accelerated">
              <SplitPanel
                gameAbility={state.currentRound.left}
                showCooldown={true}
                side="left"
                isCorrect={null}
                exitAnimation="left"
              />
            </div>
            {/* Old right moving to left position */}
            <SplitPanel
              gameAbility={state.currentRound.right}
              showCooldown={true}
              side="left"
              isCorrect={state.lastGuessCorrect}
              enterAnimation="shift-left"
            />
            {/* VS divider */}
            <div className="relative z-20 flex items-center justify-center md:h-auto md:w-0 shrink-0">
              <VsDivider />
            </div>
            {/* New right entering from off-screen right */}
            <SplitPanel
              gameAbility={state.nextRound.left}
              showCooldown={false}
              side="right"
              isCorrect={null}
              enterAnimation="right"
              onGuess={handleGuess}
              guessDisabled={true}
            />
          </>
        ) : (
          // Desktop: Normal two-panel rendering
          <>
            {/* Left panel: Known ability (always shows cooldown) */}
            <SplitPanel
              gameAbility={state.currentRound.left}
              showCooldown={true}
              side="left"
              isCorrect={null}
              skipAnimation={skipPanelAnimation}
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
              skipAnimation={skipPanelAnimation}
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
