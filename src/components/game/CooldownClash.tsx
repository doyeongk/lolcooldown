'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SplitPanel } from './SplitPanel'
import { GuessButtons } from './GuessButtons'
import { ScoreDisplay } from './ScoreDisplay'
import { GameOver } from './GameOver'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { HIGH_SCORE_KEY } from '@/lib/game/difficulty'
import { cn } from '@/lib/utils'
import type { GameAbility, GuessChoice } from '@/types/game'

const LIVES = 3
/** How long the answer stays up before the next round slides in */
const REVEAL_MS = 1200
/** Keep at least this many abilities loaded past the current one */
const BUFFER = 4

/*
 * A game is a chain of abilities; each round compares chain[index] (left/top)
 * with chain[index + 1] (right/bottom). After a correct reveal the track slides
 * one panel along and index advances, so the right ability becomes the left.
 *
 *   loading → guessing → revealed → sliding → guessing …
 *                              ↘ over (no lives left) → restart → guessing
 */
type Status = 'loading' | 'guessing' | 'revealed' | 'sliding' | 'over'

interface State {
  status: Status
  /** Incremented per game so panels remount (and fade in) on restart */
  game: number
  chain: GameAbility[]
  index: number
  score: number
  lives: number
  /** Result of the last guess, cleared when the track slides on */
  correct: boolean | null
  bestAtStart: number
}

type Action =
  | { type: 'start'; chain: GameAbility[]; best: number }
  | { type: 'append'; game: number; abilities: GameAbility[] }
  | { type: 'guess'; choice: GuessChoice }
  | { type: 'next'; instant: boolean }
  | { type: 'advance' }

const initialState: State = {
  status: 'loading', game: 0, chain: [], index: 0, score: 0, lives: LIVES, correct: null, bestAtStart: 0,
}

const advance = (s: State): State => ({ ...s, status: 'guessing', index: s.index + 1, correct: null })

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'start':
      return { ...initialState, status: 'guessing', game: s.game + 1, chain: a.chain, bestAtStart: a.best }
    case 'append':
      return a.game === s.game ? { ...s, chain: [...s.chain, ...a.abilities] } : s
    case 'guess': {
      if (s.status !== 'guessing') return s
      const left = s.chain[s.index].cooldown
      const right = s.chain[s.index + 1].cooldown
      // Ties count as correct
      const correct = right === left || (a.choice === 'higher') === (right > left)
      return { ...s, status: 'revealed', correct, score: s.score + Number(correct), lives: s.lives - Number(!correct) }
    }
    case 'next':
      if (s.status !== 'revealed') return s
      if (s.lives <= 0) return { ...s, status: 'over' }
      if (!s.chain[s.index + 2]) return s // next ability still loading; the timer retries
      return a.instant ? advance(s) : { ...s, status: 'sliding', correct: null }
    case 'advance':
      return s.status === 'sliding' ? advance(s) : s
  }
}

async function fetchAbilities(score: number, after?: GameAbility): Promise<GameAbility[]> {
  const params = new URLSearchParams({ score: String(score), count: String(BUFFER) })
  if (after) {
    params.set('after', String(after.ability.id))
    params.set('afterCooldown', String(after.cooldown))
  }
  const res = await fetch(`/api/game/random?${params}`)
  if (!res.ok) throw new Error(`Failed to fetch abilities: ${res.status}`)
  return (await res.json()).abilities
}

function readBest(): number {
  try {
    return Number(JSON.parse(localStorage.getItem(HIGH_SCORE_KEY) ?? '0')) || 0
  } catch {
    return 0
  }
}

export function CooldownClash() {
  const [s, dispatch] = useReducer(reducer, initialState)
  const [storedBest, setStoredBest] = useLocalStorage(HIGH_SCORE_KEY, 0)
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  // The board fades in once the first pair of splashes has loaded
  const [ready, setReady] = useState(false)
  const splashLoads = useRef(0)
  const fetching = useRef(false)
  // Next game's chain, fetched during game over so Try Again is instant
  const [nextChain, setNextChain] = useState<GameAbility[] | null>(null)

  useEffect(() => {
    fetchAbilities(0)
      .then((chain) => dispatch({ type: 'start', chain, best: readBest() }))
      .catch(console.error)
  }, [])

  const onSplashLoad = useCallback(() => {
    if (++splashLoads.current >= 2) setReady(true)
  }, [])

  // Don't wait forever on a slow or missing splash
  useEffect(() => {
    if (s.status === 'loading') return
    const timer = setTimeout(() => setReady(true), 2500)
    return () => clearTimeout(timer)
  }, [s.status])

  useEffect(() => {
    if (s.score > storedBest) setStoredBest(s.score)
  }, [s.score, storedBest, setStoredBest])

  useEffect(() => {
    if (s.status !== 'revealed') return
    const timer = setTimeout(() => dispatch({ type: 'next', instant: reduceMotion }), REVEAL_MS)
    return () => clearTimeout(timer)
  }, [s.status, s.chain.length, reduceMotion])

  // Keep the chain topped up, continuing from its last ability
  const last = s.chain.at(-1)
  const needsMore = (s.status === 'guessing' || s.status === 'revealed') && s.chain.length - s.index <= BUFFER
  useEffect(() => {
    if (!needsMore || !last || fetching.current) return
    fetching.current = true
    const game = s.game
    fetchAbilities(s.score, last)
      .then((abilities) => dispatch({ type: 'append', game, abilities }))
      .catch(console.error)
      .finally(() => { fetching.current = false })
  }, [needsMore, last, s.game, s.score])

  useEffect(() => {
    if (s.status !== 'over') return
    let current = true
    fetchAbilities(0).then((chain) => current && setNextChain(chain)).catch(console.error)
    return () => { current = false }
  }, [s.status])

  const restart = useCallback(async () => {
    const chain = nextChain ?? (await fetchAbilities(0).catch(() => null))
    if (!chain) return
    setNextChain(null)
    dispatch({ type: 'start', chain, best: readBest() })
  }, [nextChain])

  const guess = useCallback((choice: GuessChoice) => dispatch({ type: 'guess', choice }), [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const choice = e.key === 'ArrowUp' ? 'higher' : e.key === 'ArrowDown' ? 'lower' : null
      if (!choice) return
      e.preventDefault()
      dispatch({ type: 'guess', choice })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const sliding = s.status === 'sliding'
  const answerShown = s.status === 'revealed' || sliding || s.status === 'over'

  return (
    <>
      <div className={cn('relative h-full w-full overflow-hidden transition-opacity duration-400 ease-(--ease-out)', ready ? 'opacity-100' : 'opacity-0')}>
        <header className="absolute top-0 left-0 right-0 z-30 px-3 md:px-4 pt-[max(1.5vh,env(safe-area-inset-top))] md:pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              aria-label="Back to menu"
              className="flex items-center justify-center w-[clamp(1.75rem,4.5vh,2.5rem)] h-[clamp(1.75rem,4.5vh,2.5rem)] md:w-10 md:h-10 rounded-full bg-black/50 backdrop-blur-md border border-gold/20 text-foreground/60 hover:text-foreground hover:border-gold/40 transition-colors duration-200"
            >
              <ArrowLeft className="w-[clamp(0.875rem,2vh,1.25rem)] h-[clamp(0.875rem,2vh,1.25rem)] md:w-5 md:h-5" />
            </Link>
            <ScoreDisplay score={s.score} best={s.bestAtStart} lives={s.lives} maxLives={LIVES} />
            <div className="w-[clamp(1.75rem,4.5vh,2.5rem)] md:w-10" />
          </div>
        </header>

        <div className="relative h-full w-full overflow-hidden" role="region" aria-label="Ability comparison">
          {/*
            Track of three panels (current pair + the next ability), stacked on
            mobile and side by side on desktop. Sliding moves it one panel; when
            the transition ends, index advances and the transform snaps back in
            the same render, so the panels never visibly jump.
          */}
          <div
            className={cn(
              'flex h-[150%] flex-col md:h-full md:w-[150%] md:flex-row',
              '[--slide:translate3d(0,-33.3333%,0)] md:[--slide:translate3d(-33.3333%,0,0)]',
              sliding && 'transition-transform duration-450 ease-(--ease-drawer)'
            )}
            style={{ transform: sliding ? 'var(--slide)' : undefined }}
            onTransitionEnd={(e) => e.target === e.currentTarget && dispatch({ type: 'advance' })}
          >
            {s.chain.slice(s.index, s.index + 3).map((gameAbility, i) => (
              <SplitPanel
                key={`${s.game}-${s.index + i}`}
                gameAbility={gameAbility}
                revealed={i === 0 || (i === 1 && answerShown)}
                animateReveal={i === 1}
                correct={i === 1 ? s.correct : null}
                onGuess={i === 1 && s.status === 'guessing' ? guess : undefined}
                onSplashLoad={onSplashLoad}
                entering={s.game > 1}
              />
            ))}
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-32 w-px -translate-x-1/2 -translate-y-1/2 bg-gold/30 md:block" />
        </div>

        <GuessButtons onGuess={guess} hidden={s.status !== 'guessing'} />

        <GameOver
          open={s.status === 'over'}
          score={s.score}
          best={Math.max(s.bestAtStart, s.score)}
          isNewBest={s.score > s.bestAtStart}
          onRestart={restart}
        />
      </div>

      {/* First load: cover until the opening pair is ready */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-[#0f0d0a] transition-opacity duration-300 ease-(--ease-out)',
          ready && 'pointer-events-none opacity-0'
        )}
        aria-hidden={ready}
        role="status"
        aria-label="Loading"
      >
        <div
          className="w-32 h-32 rounded-full opacity-30 animate-breathe"
          style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.3) 0%, transparent 70%)' }}
        />
      </div>
    </>
  )
}
