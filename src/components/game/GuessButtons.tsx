'use client'

import type { GuessChoice } from '@/types/game'

interface GuessButtonsProps {
  onGuess: (choice: GuessChoice) => void
  disabled: boolean
}

export function GuessButtons({ onGuess, disabled }: GuessButtonsProps) {
  return (
    <div className="hidden md:flex flex-col gap-3 w-48">
      <button
        type="button"
        onClick={() => onGuess('higher')}
        disabled={disabled}
        className="
          flex items-center justify-center gap-2
          px-6 py-3 rounded-full
          bg-gold text-dark-blue font-bold text-lg
          transition-all duration-200
          hover:bg-gold-hover hover:scale-105
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          touch-manipulation
        "
        aria-label="Guess higher cooldown"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 15l7-7 7 7"
          />
        </svg>
        Higher
      </button>
      <button
        type="button"
        onClick={() => onGuess('lower')}
        disabled={disabled}
        className="
          flex items-center justify-center gap-2
          px-6 py-3 rounded-full
          bg-white/10 text-foreground font-bold text-lg
          border-2 border-white/30
          transition-all duration-200
          hover:bg-white/20 hover:scale-105
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          touch-manipulation
        "
        aria-label="Guess lower cooldown"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        Lower
      </button>
    </div>
  )
}
