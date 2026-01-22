'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'
import type { GuessChoice } from '@/types/game'

interface GuessButtonsProps {
  onGuess: (choice: GuessChoice) => void
  disabled: boolean
  /** Hide buttons with opacity (for mobile transitions) */
  hidden?: boolean
  /** Variant: 'inline' for desktop in-panel, 'fixed' for mobile fixed bottom */
  variant?: 'inline' | 'fixed'
}

export function GuessButtons({ onGuess, disabled, hidden = false, variant = 'inline' }: GuessButtonsProps) {
  if (variant === 'fixed') {
    // Mobile fixed bottom layout
    return (
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] transition-opacity duration-200 ${
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => onGuess('lower')}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/20 text-foreground font-bold text-base border-2 border-white/40 shadow-lg shadow-black/30 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue disabled:opacity-50 touch-manipulation"
            aria-label="Guess lower cooldown"
          >
            <ChevronDown className="w-5 h-5" strokeWidth={3} aria-hidden="true" />
            Lower
          </button>
          <button
            type="button"
            onClick={() => onGuess('higher')}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gold text-dark-blue font-bold text-base shadow-lg shadow-black/30 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue disabled:opacity-50 touch-manipulation"
            aria-label="Guess higher cooldown"
          >
            <ChevronUp className="w-5 h-5" strokeWidth={3} aria-hidden="true" />
            Higher
          </button>
        </div>
      </div>
    )
  }

  // Desktop inline layout (hidden on mobile)
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
        <ChevronUp className="w-5 h-5" strokeWidth={3} aria-hidden="true" />
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
          border border-white/30
          transition-all duration-200
          hover:bg-white/20 hover:scale-105
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          touch-manipulation
        "
        aria-label="Guess lower cooldown"
      >
        <ChevronDown className="w-5 h-5" strokeWidth={3} aria-hidden="true" />
        Lower
      </button>
    </div>
  )
}
