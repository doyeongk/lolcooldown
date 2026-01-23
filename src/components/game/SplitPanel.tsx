'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, type Variants, type Transition } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { AbilityIcon } from './AbilityIcon'
import { LevelPips } from './LevelPips'
import { numberPop, useReducedMotion } from '@/lib/motion'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'
import type { GameAbility, GuessChoice } from '@/types/game'

// Panel transition timing - optimized for 60fps (shorter = fewer frames where jank is visible)
const panelTransition: Transition = {
  type: 'tween',
  ease: [0.32, 0, 0.67, 0], // ease-out-quart - snappier feel
  duration: 0.28,
}

const slideTransition: Transition = {
  type: 'tween',
  ease: [0.32, 0, 0.67, 0],
  duration: 0.25,
}

const crossFadeTransition: Transition = {
  type: 'tween',
  ease: [0.32, 0, 0.67, 0],
  duration: 0.2,
}

// Panel variants for different animation states
const panelVariants: Variants = {
  // Default entrance from left side
  enterFromLeft: { x: '-100%', opacity: 0 },
  // Default entrance from right side
  enterFromRight: { x: '100%', opacity: 0 },
  // Carousel: enter from right (no opacity change)
  carouselEnterRight: { x: '100%', opacity: 1 },
  // Carousel: shift from right position to center
  carouselShiftFromRight: { x: '100%', opacity: 1 },
  // Center/visible position
  center: { x: 0, y: 0, opacity: 1 },
  // Carousel: exit to left
  exitLeft: { x: '-100%', opacity: 1 },
  // Cross-fade: enter with fade
  crossFadeEnter: { opacity: 0 },
  // Cross-fade: exit with fade
  crossFadeExit: { opacity: 0 },
  // Mobile vertical: enter from bottom
  slideUpEnter: { y: '100%', opacity: 1 },
  // Mobile vertical: exit to top
  slideUpExit: { y: '-100%', opacity: 1 },
  // Mobile vertical: shift from bottom
  slideUpShift: { y: '100%', opacity: 1 },
}

const SPLASH_BLUR = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAACAAoDASIAAhEBAxEB/8QAHAAAAQUBAQEAAAAAAAAAAAAAAAIDBEEDBAUF/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="

// Click zone hover overlay variants
const clickZoneOverlayVariants: Variants = {
  idle: {
    opacity: 0,
  },
  active: {
    opacity: 1,
  },
}

// Chevron bounce animation variants
const chevronVariants: Variants = {
  idle: {
    y: 0,
  },
  activeUp: {
    y: [0, -4, 0],
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
  activeDown: {
    y: [0, 4, 0],
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
}

interface ClickZonesProps {
  onGuess: (choice: GuessChoice) => void
  disabled: boolean
}

function ClickZones({ onGuess, disabled }: ClickZonesProps) {
  const [hoveredZone, setHoveredZone] = useState<'top' | 'bottom' | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const handleClick = (choice: GuessChoice) => {
    if (!disabled) {
      onGuess(choice)
    }
  }

  const isTopActive = hoveredZone === 'top' && !disabled
  const isBottomActive = hoveredZone === 'bottom' && !disabled

  return (
    <>
      {/* Top zone gradient overlay - fades from top edge toward center */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[60%] pointer-events-none z-20"
        variants={clickZoneOverlayVariants}
        initial="idle"
        animate={isTopActive ? 'active' : 'idle'}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% -10%, rgba(var(--gold-rgb), 0.25) 0%, rgba(var(--gold-rgb), 0.12) 30%, transparent 70%),
            linear-gradient(to bottom, rgba(var(--gold-rgb), 0.15) 0%, rgba(var(--gold-rgb), 0.06) 30%, transparent 80%)
          `,
        }}
      />

      {/* Bottom zone gradient overlay - fades from bottom edge toward center */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[60%] pointer-events-none z-20"
        variants={clickZoneOverlayVariants}
        initial="idle"
        animate={isBottomActive ? 'active' : 'idle'}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 110%, rgba(var(--gold-rgb), 0.25) 0%, rgba(var(--gold-rgb), 0.12) 30%, transparent 70%),
            linear-gradient(to top, rgba(var(--gold-rgb), 0.15) 0%, rgba(var(--gold-rgb), 0.06) 30%, transparent 80%)
          `,
        }}
      />

      {/* Top click zone - HIGHER */}
      <button
        type="button"
        onClick={() => handleClick('higher')}
        onMouseEnter={() => !disabled && setHoveredZone('top')}
        onMouseLeave={() => setHoveredZone(null)}
        disabled={disabled}
        className="absolute inset-x-0 top-0 h-1/2 z-30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset"
        aria-label="Guess higher cooldown"
      >
        {/* Label with animated icon */}
        <motion.div
          className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          animate={{
            opacity: isTopActive ? 1 : 0.7,
            scale: isTopActive ? 1.1 : 1,
          }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <motion.div
            variants={chevronVariants}
            initial="idle"
            animate={isTopActive && !prefersReducedMotion ? 'activeUp' : 'idle'}
          >
            <ChevronUp className="w-8 h-8 text-gold drop-shadow-[0_0_8px_rgba(var(--gold-rgb),0.5)]" strokeWidth={2.5} />
          </motion.div>
          <span
            className="text-sm font-bold uppercase tracking-widest text-gold drop-shadow-[0_0_8px_rgba(var(--gold-rgb),0.4)]"
            style={{
              textShadow: isTopActive ? '0 0 16px rgba(var(--gold-rgb), 1)' : undefined,
            }}
          >
            Higher
          </span>
        </motion.div>
      </button>

      {/* Bottom click zone - LOWER */}
      <button
        type="button"
        onClick={() => handleClick('lower')}
        onMouseEnter={() => !disabled && setHoveredZone('bottom')}
        onMouseLeave={() => setHoveredZone(null)}
        disabled={disabled}
        className="absolute inset-x-0 bottom-0 h-1/2 z-30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset"
        aria-label="Guess lower cooldown"
      >
        {/* Label with animated icon */}
        <motion.div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          animate={{
            opacity: isBottomActive ? 1 : 0.7,
            scale: isBottomActive ? 1.1 : 1,
          }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <span
            className="text-sm font-bold uppercase tracking-widest text-gold drop-shadow-[0_0_8px_rgba(var(--gold-rgb),0.4)]"
            style={{
              textShadow: isBottomActive ? '0 0 16px rgba(var(--gold-rgb), 1)' : undefined,
            }}
          >
            Lower
          </span>
          <motion.div
            variants={chevronVariants}
            initial="idle"
            animate={isBottomActive && !prefersReducedMotion ? 'activeDown' : 'idle'}
          >
            <ChevronDown className="w-8 h-8 text-gold drop-shadow-[0_0_8px_rgba(var(--gold-rgb),0.5)]" strokeWidth={2.5} />
          </motion.div>
        </motion.div>
      </button>
    </>
  )
}

interface SplitPanelProps {
  gameAbility: GameAbility
  showCooldown: boolean
  side: 'left' | 'right'
  isCorrect: boolean | null
  onGuess?: (choice: GuessChoice) => void
  guessDisabled?: boolean
  exitAnimation?: 'left' | 'cross-fade' | 'slide-up'
  enterAnimation?: 'right' | 'shift-left' | 'cross-fade' | 'slide-up-shift' | 'slide-up'
  skipAnimation?: boolean
}

export function SplitPanel({
  gameAbility,
  showCooldown,
  side,
  isCorrect,
  onGuess,
  guessDisabled = false,
  exitAnimation,
  enterAnimation,
  skipAnimation = false,
}: SplitPanelProps) {
  const { ability, level, cooldown } = gameAbility
  const { champion } = ability
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  // Desktop click zones: show on right panel when not revealing cooldown
  const showClickZones = !isMobile && side === 'right' && !showCooldown && onGuess

  // Determine animation states based on props
  const getAnimationState = (): {
    initial: string | false
    animate: string
    transition: Transition
  } => {
    // Skip animation entirely (reduced motion or explicit skip)
    if (skipAnimation || prefersReducedMotion) {
      return { initial: false, animate: 'center', transition: panelTransition }
    }

    // Exit animations
    if (exitAnimation === 'left') {
      return { initial: 'center', animate: 'exitLeft', transition: panelTransition }
    }
    if (exitAnimation === 'cross-fade') {
      return { initial: 'center', animate: 'crossFadeExit', transition: crossFadeTransition }
    }
    if (exitAnimation === 'slide-up') {
      return { initial: 'center', animate: 'slideUpExit', transition: slideTransition }
    }

    // Enter animations
    if (enterAnimation === 'shift-left') {
      return { initial: 'carouselShiftFromRight', animate: 'center', transition: panelTransition }
    }
    if (enterAnimation === 'right') {
      return { initial: 'carouselEnterRight', animate: 'center', transition: panelTransition }
    }
    if (enterAnimation === 'cross-fade') {
      return { initial: 'crossFadeEnter', animate: 'center', transition: crossFadeTransition }
    }
    if (enterAnimation === 'slide-up-shift') {
      return { initial: 'slideUpShift', animate: 'center', transition: slideTransition }
    }
    if (enterAnimation === 'slide-up') {
      return { initial: 'slideUpEnter', animate: 'center', transition: slideTransition }
    }

    // Default slide-in based on side
    if (side === 'left') {
      return { initial: 'enterFromLeft', animate: 'center', transition: slideTransition }
    }
    return { initial: 'enterFromRight', animate: 'center', transition: slideTransition }
  }

  const animationState = getAnimationState()

  return (
    <motion.div
      className="relative h-full md:flex-1 flex flex-col items-center overflow-hidden pt-[calc(5.5rem+env(safe-area-inset-top))] pb-16 md:justify-center md:pt-0 md:pb-0"
      variants={panelVariants}
      initial={animationState.initial}
      animate={animationState.animate}
      transition={animationState.transition}
      style={{
        willChange: 'transform',
        contain: 'layout paint',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* Champion splash background */}
      {champion.splash && (
        <div className="absolute inset-0 bg-background">
          <Image
            src={champion.splash}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            quality={60}
            placeholder="blur"
            blurDataURL={SPLASH_BLUR}
            className="object-cover object-top saturate-[0.7]"
          />
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Blur vignette - depth-of-field effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          maskImage: 'radial-gradient(ellipse 75% 65% at center, transparent 0%, black 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at center, transparent 0%, black 75%)',
        }}
      />

      {/* Atmospheric haze */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 85% 75% at center, rgba(15, 13, 10, 0.05) 0%, rgba(15, 13, 10, 0.25) 100%)',
        }}
      />

      {/* Cinematic vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at center, transparent 25%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0.7) 100%)',
        }}
      />

      {/* Correct/incorrect feedback overlay - always rendered, controlled via opacity */}
      <div
        className={`absolute inset-0 transition-opacity duration-400 pointer-events-none ${
          isCorrect === true
            ? 'bg-green-500/30 opacity-100'
            : isCorrect === false
              ? 'bg-red-500/30 opacity-100'
              : 'opacity-[0.01]'
        }`}
      />

      {/* Desktop click zones for right panel (pre-guess state only) */}
      {showClickZones && onGuess && (
        <ClickZones onGuess={onGuess} disabled={guessDisabled} />
      )}

      {/* Content - no z-index so AbilityIcon can escape to panel stacking context */}
      <div className="relative flex flex-col items-center md:justify-center text-center px-4 h-full">
        <div className="flex flex-col items-center gap-1 md:gap-5">
          {/* Champion name + ability slot */}
          <h2
            className="text-lg md:text-2xl lg:text-3xl font-bold drop-shadow-lg tracking-wider uppercase"
            style={{ textShadow: '0 0 40px rgba(var(--gold-rgb), 0.25)' }}
          >
            <span className="text-foreground">{champion.name}</span>
            {' '}
            <span className="text-gold">{ability.slot}</span>
          </h2>

          {/* Ability icon + name row */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Ability icon with integrated badge - z-40 to sit above click zones (z-30) for tooltip access */}
            <div className="relative z-40">
              <AbilityIcon
                icon={ability.icon}
                name={ability.name}
                description={ability.description}
              />
              {/* Ability slot badge - overlaps bottom-left corner */}
              {/* Outer border layer */}
              <div
                className="absolute -bottom-1 -left-1 md:-bottom-2.5 md:-left-2.5 w-7 h-7 md:w-12 md:h-12 z-10"
                style={{
                  clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
                  background: 'linear-gradient(135deg, #1e3a4a 0%, #172b3b 50%, #0f1f2a 100%)',
                  boxShadow: '0 0 12px rgba(var(--gold-rgb), 0.5), 0 2px 6px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Inner gold badge */}
                <div
                  className="absolute inset-[2px] flex items-center justify-center font-bold text-sm md:text-lg text-dark-blue"
                  style={{
                    clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
                    background: 'linear-gradient(135deg, #f5e8a3 0%, #d4a84b 35%, #c4983b 65%, #a87b2a 100%)',
                  }}
                >
                  {/* Inner highlight */}
                  <div
                    className="absolute inset-[1px] pointer-events-none"
                    style={{
                      clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    }}
                  />
                  <span className="relative">{ability.slot}</span>
                </div>
              </div>
            </div>

            {/* Ability name */}
            <p
              className="text-sm md:text-lg text-foreground/80 font-medium tracking-wide uppercase"
              style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)' }}
            >
              {ability.name}
            </p>
          </div>

          {/* Level pips */}
          <div className="mt-1 md:mt-3">
            <LevelPips level={level} slot={ability.slot as 'Q' | 'W' | 'E' | 'R' | 'P'} />
          </div>

          {/* Cooldown display - wrapper reserves space to prevent layout shift */}
          <div className="min-h-[2.5rem] md:min-h-[4rem] lg:min-h-[5rem] mt-1 flex items-center justify-center">
            {showCooldown && (
              <motion.p
                key={`cooldown-${cooldown}`}
                variants={side === 'right' ? numberPop : undefined}
                initial={side === 'right' ? 'hidden' : false}
                animate={side === 'right' ? 'visible' : undefined}
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-gold drop-shadow-lg tracking-wide"
                style={{
                  textShadow: '0 0 40px rgba(var(--gold-rgb), 0.5)',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
                }}
              >
                {cooldown}s
              </motion.p>
            )}
          </div>

          {/* Mystery cooldown placeholder for right panel before guess */}
          {showClickZones && (
            <motion.p
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gold drop-shadow-lg tracking-wide mt-2"
              style={{
                textShadow: '0 0 40px rgba(var(--gold-rgb), 0.5)',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
              }}
              animate={prefersReducedMotion ? {} : {
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
            >
              ???
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
