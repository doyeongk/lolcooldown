'use client'

import type { GuessChoice } from '@/types/game'

interface MobileGuessButtonsProps {
  onGuess: (choice: GuessChoice) => void
  disabled: boolean
}

export function MobileGuessButtons({ onGuess, disabled }: MobileGuessButtonsProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-blue/90 backdrop-blur-sm border-t border-gold/20 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="flex gap-3 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => onGuess('higher')}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gold text-dark-blue font-bold text-base transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue disabled:opacity-50 touch-manipulation"
          aria-label="Guess higher cooldown"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
          </svg>
          Higher
        </button>
        <button
          type="button"
          onClick={() => onGuess('lower')}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/10 text-foreground font-bold text-base border-2 border-white/30 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue disabled:opacity-50 touch-manipulation"
          aria-label="Guess lower cooldown"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
          Lower
        </button>
      </div>
    </div>
  )
}
