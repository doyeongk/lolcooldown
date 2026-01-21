'use client'

import type { GuessChoice } from '@/types/game'

interface GuessButtonsProps {
  onGuess: (choice: GuessChoice) => void
  disabled: boolean
}

export function GuessButtons({ onGuess, disabled }: GuessButtonsProps) {
  return (
    <div className="flex flex-row md:flex-col gap-3 md:gap-3 w-full md:w-48">
      {/* Mobile: Lower first (left), Higher second (right) */}
      {/* Desktop: Higher first (top), Lower second (bottom) */}
      <button
        type="button"
        onClick={() => onGuess('lower')}
        disabled={disabled}
        className="
          flex-1 md:flex-none order-1 md:order-2
          flex items-center justify-center gap-3 md:gap-2
          px-6 md:px-6 py-4 md:py-3 rounded-xl md:rounded-full
          bg-white/20 md:bg-white/10 text-foreground font-bold text-xl md:text-lg
          border-2 border-white/40 md:border-white/30
          shadow-lg shadow-black/30 md:shadow-none
          transition-all duration-200
          active:scale-[0.98] md:active:scale-100
          md:hover:bg-white/20 md:hover:scale-105
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue
          disabled:opacity-50 disabled:cursor-not-allowed md:disabled:hover:scale-100
          touch-manipulation
        "
        aria-label="Guess lower cooldown"
      >
        <svg
          className="w-6 h-6 md:w-5 md:h-5"
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
      <button
        type="button"
        onClick={() => onGuess('higher')}
        disabled={disabled}
        className="
          flex-1 md:flex-none order-2 md:order-1
          flex items-center justify-center gap-3 md:gap-2
          px-6 md:px-6 py-4 md:py-3 rounded-xl md:rounded-full
          bg-gold text-dark-blue font-bold text-xl md:text-lg
          shadow-lg shadow-black/30 md:shadow-none
          transition-all duration-200
          active:scale-[0.98] md:active:scale-100
          md:hover:bg-gold-hover md:hover:scale-105
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue
          disabled:opacity-50 disabled:cursor-not-allowed md:disabled:hover:scale-100
          touch-manipulation
        "
        aria-label="Guess higher cooldown"
      >
        <svg
          className="w-6 h-6 md:w-5 md:h-5"
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
    </div>
  )
}
