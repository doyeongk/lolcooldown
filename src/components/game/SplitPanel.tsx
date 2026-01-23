'use client'

import Image from 'next/image'
import { motion, type Variants, type Transition } from 'framer-motion'
import { AbilityIcon } from './AbilityIcon'
import { GuessButtons } from './GuessButtons'
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
            className="object-cover object-top"
          />
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

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
      <div className="relative z-10 flex flex-col items-center text-center px-4 gap-2 md:gap-4 py-4 md:py-6 h-full md:h-auto">
        {/* Champion name + slot */}
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg"
          style={{ textShadow: '0 0 40px rgba(var(--gold-rgb), 0.25)' }}
        >
          <span className="text-foreground">{champion.name}</span>{' '}
          <span className="text-gold">{ability.slot}</span>
        </h2>

        {/* Ability icon and name */}
        <div className="flex items-center gap-3">
          <AbilityIcon
            icon={ability.icon}
            name={ability.name}
            description={ability.description}
          />
          <p className="text-lg md:text-xl lg:text-2xl text-foreground/90 drop-shadow-lg">
            {ability.name}
          </p>
        </div>

        {/* Level badge */}
        <span className="text-base md:text-lg text-foreground/70 bg-gradient-to-b from-black/50 to-black/60 backdrop-blur-sm px-5 py-1.5 rounded-full border border-gold/40">
          Lv. {level}
        </span>

        {/* Spacer - pushes action slot to vertical center of remaining space on mobile */}
        <div className="flex-1 md:hidden" />

        {/* Action slot - fixed height for layout stability */}
        <div className="md:mt-6 h-[56px] md:h-[110px] flex items-center justify-center">
          {showCooldown ? (
            <motion.p
              key={`cooldown-${cooldown}`}
              variants={side === 'right' ? numberPop : undefined}
              initial={side === 'right' ? 'hidden' : false}
              animate={side === 'right' ? 'visible' : undefined}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gold drop-shadow-lg"
              style={{ textShadow: '0 0 40px rgba(var(--gold-rgb), 0.5)' }}
            >
              {cooldown}s
            </motion.p>
          ) : onGuess ? (
            <GuessButtons onGuess={onGuess} disabled={guessDisabled} />
          ) : (
            <div className="w-48" />
          )}
        </div>

        {/* Bottom spacer - balances the top spacer to center action slot */}
        <div className="flex-1 md:hidden" />
      </div>
    </motion.div>
  )
}
