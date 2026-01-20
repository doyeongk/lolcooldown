'use client'

import Image from 'next/image'
import type { GameAbility } from '@/types/game'

const SPLASH_BLUR = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAACAAoDASIAAhEBAxEB/8QAHAAAAQUBAQEAAAAAAAAAAAAAAAIDBEEDBAUF/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="

interface AbilityCardProps {
  gameAbility: GameAbility
  showCooldown: boolean
  alwaysShowCooldown?: boolean
  isCorrect?: boolean | null
  side: 'left' | 'right'
}

export function AbilityCard({ gameAbility, showCooldown, alwaysShowCooldown, isCorrect, side }: AbilityCardProps) {
  const { ability, level, cooldown } = gameAbility
  const { champion } = ability

  const borderClass =
    isCorrect === true
      ? 'border-green-500 animate-correct-pulse'
      : isCorrect === false
        ? 'border-red-500 animate-incorrect-shake'
        : 'border-white/20'

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center gap-5 p-8
        rounded-2xl border-2 transition-colors overflow-hidden
        ${borderClass}
        ${side === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right'}
      `}
    >
      {/* Splash background */}
      {champion.splash && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={champion.splash}
            alt=""
            fill
            sizes="100vw"
            quality={60}
            placeholder="blur"
            blurDataURL={SPLASH_BLUR}
            className="object-cover object-top opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-blue via-dark-blue/80 to-dark-blue/40" />
        </div>
      )}
      {!champion.splash && (
        <div className="absolute inset-0 -z-10 bg-dark-blue/50" />
      )}

      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gold">
          <Image
            src={champion.icon}
            alt={champion.name}
            fill
            sizes="(max-width: 640px) 64px, 96px"
            className="object-cover"
          />
        </div>
        <div className="text-left">
          <h3 className="text-2xl font-bold text-foreground">{champion.name}</h3>
          <p className="text-base text-gold font-semibold">{ability.slot}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {ability.icon && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20">
            <Image
              src={ability.icon}
              alt={ability.name}
              fill
              sizes="(max-width: 640px) 48px, 64px"
              className="object-cover"
            />
          </div>
        )}
        <div className="text-left max-w-[280px]">
          <p className="text-lg font-semibold text-foreground">{ability.name}</p>
          <p className="text-sm text-foreground/60">Lv.{level}</p>
          {ability.description && (
            <p className="text-xs text-foreground/50 mt-1">{ability.description}</p>
          )}
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm text-foreground/60 mb-1">Cooldown</p>
        {alwaysShowCooldown || showCooldown ? (
          <p className={`text-5xl font-bold text-gold ${showCooldown && !alwaysShowCooldown ? 'animate-cooldown-reveal' : ''}`}>{cooldown}s</p>
        ) : (
          <p className="text-5xl font-bold text-white/40">?</p>
        )}
      </div>
    </div>
  )
}
