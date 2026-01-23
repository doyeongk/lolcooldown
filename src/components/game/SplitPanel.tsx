'use client'

import Image from 'next/image'
import { motion, type Variants, type Transition } from 'framer-motion'
import { AbilityIcon } from './AbilityIcon'
import { GuessButtons } from './GuessButtons'
import { LevelPips } from './LevelPips'
import { numberPop, useReducedMotion } from '@/lib/motion'
import type { GameAbility, GuessChoice } from '@/types/game'

// Panel transition timing (matches existing CSS: 0.5s ease-out for carousel, 0.4s for slides, 0.3s for cross-fade)
const panelTransition: Transition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1], // cubic-bezier approximating ease-out
  duration: 0.5,
}

const slideTransition: Transition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.4,
}

const crossFadeTransition: Transition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.3,
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
      className="relative h-full md:flex-1 flex flex-col items-center justify-center overflow-hidden pt-16 pb-6 md:pt-0 md:pb-0"
      variants={panelVariants}
      initial={animationState.initial}
      animate={animationState.animate}
      transition={animationState.transition}
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* Champion splash background */}
      {champion.splash && (
        <div className="absolute inset-0">
          <Image
            key={`splash-${champion.id}`}
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

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 py-4 md:py-6 h-full justify-between">
        {/* Top spacer for header clearance on mobile */}
        <div className="h-4 md:h-8 shrink-0" />

        {/* Main content area - centered vertically */}
        <div className="flex flex-col items-center gap-3 md:gap-5">
          {/* Champion name */}
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg tracking-wide"
            style={{ textShadow: '0 0 40px rgba(var(--gold-rgb), 0.25)' }}
          >
            <span className="text-foreground">{champion.name}</span>
          </h2>

          {/* Ability icon with integrated badge - cohesive unit */}
          <div className="relative">
            {/* Main ability icon */}
            <AbilityIcon
              icon={ability.icon}
              name={ability.name}
              description={ability.description}
            />
            {/* Ability slot badge - overlaps bottom-right corner */}
            <div
              className="absolute -bottom-2 -right-2 md:-bottom-2.5 md:-right-2.5 w-9 h-9 md:w-11 md:h-11 flex items-center justify-center font-bold text-base md:text-lg text-dark-blue z-10"
              style={{
                clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
                background: 'linear-gradient(135deg, #f5e8a3 0%, #d4a84b 35%, #c4983b 65%, #a87b2a 100%)',
                boxShadow: '0 0 12px rgba(var(--gold-rgb), 0.5), 0 2px 6px rgba(0, 0, 0, 0.5)',
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

          {/* Ability name */}
          <p className="text-base md:text-lg lg:text-xl text-foreground/90 uppercase tracking-wider font-medium drop-shadow-lg">
            {ability.name}
          </p>

          {/* Level pips */}
          <LevelPips level={level} slot={ability.slot as 'Q' | 'W' | 'E' | 'R' | 'P'} />

          {/* Cooldown display (shown when revealing on both panels) */}
          {showCooldown && (
            <motion.p
              key={`cooldown-${cooldown}`}
              variants={side === 'right' ? numberPop : undefined}
              initial={side === 'right' ? 'hidden' : false}
              animate={side === 'right' ? 'visible' : undefined}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gold drop-shadow-lg tracking-wide mt-2"
              style={{
                textShadow: '0 0 40px rgba(var(--gold-rgb), 0.5)',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
              }}
            >
              {cooldown}s
            </motion.p>
          )}
        </div>

        {/* Bottom action area - buttons anchor here */}
        <div className="shrink-0 w-full flex justify-center pb-2 md:pb-4">
          {!showCooldown && onGuess ? (
            <GuessButtons onGuess={onGuess} disabled={guessDisabled} />
          ) : (
            <div className="h-[130px] md:h-[160px]" /> // Spacer to maintain layout
          )}
        </div>
      </div>
    </motion.div>
  )
}
