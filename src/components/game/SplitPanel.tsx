'use client'

import { memo } from 'react'
import Image from 'next/image'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { AbilityIcon } from './AbilityIcon'
import { LevelPips } from './LevelPips'
import { cn } from '@/lib/utils'
import type { GameAbility, GuessChoice } from '@/types/game'

const SPLASH_BLUR = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAACAAoDASIAAhEBAxEB/8QAHAAAAQUBAQEAAAAAAAAAAAAAAAIDBEEDBAUF/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="

const OCTAGON = 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)'

const FEEDBACK = {
  correct: 'inset 0 0 80px 30px rgba(34, 197, 94, 0.35)',
  wrong: 'inset 0 0 100px 40px rgba(239, 68, 68, 0.4)',
}

/** Desktop guess zone: the top half of the right panel guesses higher, the bottom half lower. */
function ClickZone({ choice, onGuess }: { choice: GuessChoice; onGuess: (choice: GuessChoice) => void }) {
  const up = choice === 'higher'
  const Chevron = up ? ChevronUp : ChevronDown
  return (
    <button
      type="button"
      onClick={() => onGuess(choice)}
      aria-label={`Guess ${choice} cooldown`}
      className={cn(
        'group absolute inset-x-0 z-30 hidden h-1/2 cursor-pointer md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset',
        up ? 'top-0' : 'bottom-0'
      )}
    >
      {/* Gold wash from the zone's edge toward the centre */}
      <span
        aria-hidden="true"
        className={cn('pointer-events-none absolute inset-x-0 h-[120%] opacity-0 transition-opacity duration-250 group-hover:opacity-100', up ? 'top-0' : 'bottom-0')}
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% ${up ? '-10%' : '110%'}, rgba(var(--gold-rgb), 0.25) 0%, rgba(var(--gold-rgb), 0.12) 30%, transparent 70%),
            linear-gradient(to ${up ? 'bottom' : 'top'}, rgba(var(--gold-rgb), 0.15) 0%, rgba(var(--gold-rgb), 0.06) 30%, transparent 80%)
          `,
        }}
      />
      <span
        className={cn(
          'absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 opacity-70 transition-[opacity,scale] duration-200 ease-(--ease-out) group-hover:scale-110 group-hover:opacity-100',
          up ? 'top-5 flex-col' : 'bottom-5 flex-col-reverse'
        )}
      >
        <Chevron
          className={cn('w-8 h-8 text-gold drop-shadow-[0_0_8px_rgba(var(--gold-rgb),0.5)] group-hover:animate-nudge', !up && '[--nudge:4px]')}
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <span className="text-sm font-bold uppercase tracking-widest text-gold drop-shadow-[0_0_8px_rgba(var(--gold-rgb),0.4)] group-hover:[text-shadow:0_0_16px_rgba(var(--gold-rgb),1)]">
          {up ? 'Higher' : 'Lower'}
        </span>
      </span>
    </button>
  )
}

interface SplitPanelProps {
  gameAbility: GameAbility
  revealed: boolean
  /** Play the reveal animation when the cooldown appears (the guessed panel only) */
  animateReveal?: boolean
  /** Result of the guess about this panel, shown as an edge glow */
  correct?: boolean | null
  /** Present while this panel is awaiting a guess (desktop click zones) */
  onGuess?: (choice: GuessChoice) => void
  onSplashLoad?: () => void
  /** Fade in on mount (new game after a restart) */
  entering?: boolean
}

export const SplitPanel = memo(function SplitPanel({
  gameAbility,
  revealed,
  animateReveal = false,
  correct = null,
  onGuess,
  onSplashLoad,
  entering = false,
}: SplitPanelProps) {
  const { ability, level, cooldown } = gameAbility
  const { champion } = ability

  return (
    <section
      className={cn('relative h-1/3 w-full shrink-0 overflow-hidden md:h-full md:w-1/3', entering && 'animate-fade-in')}
      aria-label={`${champion.name} ${ability.slot}, ${ability.name}`}
    >
      {champion.splash && (
        <Image
          src={champion.splash}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          quality={60}
          loading="eager"
          placeholder="blur"
          blurDataURL={SPLASH_BLUR}
          onLoad={onSplashLoad}
          className="object-cover object-top saturate-[0.7]"
        />
      )}

      {/* Depth of field: sharp centre, blurred edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          maskImage: 'radial-gradient(ellipse 75% 65% at center, transparent 0%, black 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at center, transparent 0%, black 75%)',
        }}
      />
      {/* Cinematic vignette over haze over a flat darken */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 70% at center, transparent 25%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0.7) 100%),
            radial-gradient(ellipse 85% 75% at center, rgba(15, 13, 10, 0.05) 0%, rgba(15, 13, 10, 0.25) 100%),
            rgba(0, 0, 0, 0.4)
          `,
        }}
      />

      {/* Correct/wrong edge glow: quick in, softer out, one layer per colour so each fades in its own */}
      {([true, false] as const).map((kind) => (
        <div
          key={String(kind)}
          aria-hidden="true"
          className={cn(
            'absolute inset-0 pointer-events-none transition-opacity ease-(--ease-out)',
            correct === kind ? 'opacity-100 duration-150' : 'opacity-0 duration-300'
          )}
          style={{ boxShadow: kind ? FEEDBACK.correct : FEEDBACK.wrong }}
        />
      ))}

      {onGuess && (
        <>
          <ClickZone choice="higher" onGuess={onGuess} />
          <ClickZone choice="lower" onGuess={onGuess} />
        </>
      )}

      {/* Mobile safe zones: top 20% clears the score bar, bottom 20% the guess buttons */}
      <div className="relative h-full flex flex-col md:items-center md:justify-center">
        <div className="h-[20%] shrink-0 md:hidden" aria-hidden="true" />
        <div className="h-[60%] md:h-auto shrink-0 flex flex-col items-center justify-center text-center px-4">
          <div className="flex flex-col items-center gap-1 md:gap-5">
            <h2
              className="text-lg md:text-2xl lg:text-3xl font-bold drop-shadow-lg tracking-wider uppercase"
              style={{ textShadow: '0 0 40px rgba(var(--gold-rgb), 0.25)' }}
            >
              <span className="text-foreground">{champion.name}</span> <span className="text-gold">{ability.slot}</span>
            </h2>

            <div className="flex items-center gap-3 md:gap-4">
              {/* z-40 keeps the icon's tooltip reachable above the click zones */}
              <div className="relative z-40">
                <AbilityIcon icon={ability.icon} name={ability.name} description={ability.description} />
                <div
                  className="absolute -bottom-1 -left-1 md:-bottom-2.5 md:-left-2.5 w-7 h-7 md:w-12 md:h-12 z-10 p-[2px]"
                  style={{ clipPath: OCTAGON, background: 'linear-gradient(135deg, #1e3a4a 0%, #172b3b 50%, #0f1f2a 100%)' }}
                  aria-hidden="true"
                >
                  <div
                    className="flex h-full items-center justify-center font-bold text-sm md:text-lg text-dark-blue"
                    style={{
                      clipPath: OCTAGON,
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%), linear-gradient(135deg, #f5e8a3 0%, #d4a84b 35%, #c4983b 65%, #a87b2a 100%)',
                    }}
                  >
                    {ability.slot}
                  </div>
                </div>
              </div>
              <p
                className="text-sm md:text-lg text-foreground/80 font-medium tracking-wide uppercase"
                style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)' }}
              >
                {ability.name}
              </p>
            </div>

            <div className="mt-1 md:mt-3">
              <LevelPips level={level} slot={ability.slot} />
            </div>

            {/* Reserved height so the reveal never shifts the layout */}
            <div
              className="min-h-[2.5rem] md:min-h-[4rem] lg:min-h-[5rem] mt-1 flex items-center justify-center"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))' }}
              aria-live="polite"
            >
              <p
                className={cn(
                  'text-3xl md:text-5xl lg:text-6xl font-bold text-gold tracking-wide',
                  !revealed && 'animate-pending',
                  revealed && animateReveal && (correct === false ? 'animate-cd-wrong' : 'animate-cd-reveal')
                )}
                style={{ textShadow: '0 0 40px rgba(var(--gold-rgb), 0.5)' }}
              >
                {revealed ? `${cooldown}s` : '???'}
              </p>
            </div>
          </div>
        </div>
        <div className="h-[20%] shrink-0 md:hidden" aria-hidden="true" />
      </div>
    </section>
  )
})
