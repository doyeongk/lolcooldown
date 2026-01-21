'use client'

import Image from 'next/image'
import { AbilityIcon } from './AbilityIcon'
import { GuessButtons } from './GuessButtons'
import type { GameAbility, GuessChoice } from '@/types/game'

const SPLASH_BLUR = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAACAAoDASIAAhEBAxEB/8QAHAAAAQUBAQEAAAAAAAAAAAAAAAIDBEEDBAUF/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="

interface SplitPanelProps {
  gameAbility: GameAbility
  showCooldown: boolean
  side: 'left' | 'right'
  isCorrect: boolean | null
  onGuess?: (choice: GuessChoice) => void
  guessDisabled?: boolean
  exitAnimation?: 'left' | 'cross-fade'
  enterAnimation?: 'right' | 'shift-left' | 'cross-fade'
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

  const feedbackOverlayClass =
    isCorrect === true
      ? 'bg-green-500/30'
      : isCorrect === false
        ? 'bg-red-500/30'
        : ''

  // Determine animation class based on transition state
  let panelAnimation = ''
  if (skipAnimation) {
    panelAnimation = ''  // No animation - panels already in position
  } else if (exitAnimation === 'left') {
    panelAnimation = 'animate-panel-exit-left'
  } else if (exitAnimation === 'cross-fade') {
    panelAnimation = 'animate-panel-cross-fade-exit'
  } else if (enterAnimation === 'shift-left') {
    panelAnimation = 'animate-panel-shift-left'
  } else if (enterAnimation === 'right') {
    panelAnimation = 'animate-panel-enter-right'
  } else if (enterAnimation === 'cross-fade') {
    panelAnimation = 'animate-panel-cross-fade-enter'
  } else if (side === 'left') {
    panelAnimation = 'animate-panel-slide-left'
  } else {
    panelAnimation = 'animate-panel-slide-right'
  }

  return (
    <div
      className={`
        relative h-[calc(var(--vh,1vh)*50)] md:h-full md:flex-1 flex flex-col items-center justify-center
        overflow-hidden ${panelAnimation}
        ${side === 'left' ? 'pt-16 pb-10 md:pt-0 md:pb-0' : ''}
      `}
    >
      {/* Champion splash background */}
      {champion.splash && (
        <div className="absolute inset-0">
          <Image
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

      {/* Correct/incorrect feedback overlay */}
      {isCorrect !== null && (
        <div
          className={`absolute inset-0 ${feedbackOverlayClass} transition-opacity duration-300`}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 gap-2 md:gap-4 py-4 md:py-6">
        {/* Champion name + slot */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg">
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
        <span className="text-base md:text-lg text-foreground/70 bg-dark-blue/60 px-5 py-1.5 rounded-full">
          Lv. {level}
        </span>

        {/* Cooldown or buttons */}
        <div className="mt-2 md:mt-6 md:min-h-[110px] md:flex md:items-center md:justify-center">
          {showCooldown ? (
            <p
              className={`text-5xl md:text-6xl lg:text-7xl font-bold text-gold drop-shadow-lg ${
                side === 'right' ? 'animate-number-pop' : ''
              }`}
            >
              {cooldown}s
            </p>
          ) : onGuess ? (
            <GuessButtons onGuess={onGuess} disabled={guessDisabled} />
          ) : (
            <p className="text-5xl md:text-6xl lg:text-7xl font-bold text-gold/50 drop-shadow-lg">???</p>
          )}
        </div>
      </div>
    </div>
  )
}
